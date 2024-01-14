#!/usr/bin/env python3

# NO ADDITIONAL IMPORTS!
# (except in the last part of the lab; see the lab writeup for details)
import math
from PIL import Image


# VARIOUS FILTERS

def color_curve(image, color, start_input, end_input, multiple):
	"""
	Given color (r, g, or b to modify), the range of values to modify inclusive, and
	the multiple to modify the middle value, returns a color image 
	representing the result of applying a smooth color curve filter on an image.
	"""
	newImage = {k:v for k,v in image.items()}
	if multiple > 0.25: multiple = 0.25
	if multiple < -0.25: multiple = -0.25
	# the curve will be parabolic, looks for coefficient	
	mid_input = (start_input + end_input) // 2
	max_output = mid_input * (1 + abs(multiple))
	coefficient = max_output / mid_input**2
	if multiple < 0:
		coefficient *= -1
	# dict for new values
	new_outputs = {}
	for val in range(start_input, end_input + 1):
		new_val = val + coefficient * (val - start_input)**2
		if new_val > 255:
			new_val = 255
		if new_val < 0:
			new_val = 0
		new_outputs[val] = round(new_val)
	keys = set(new_outputs.keys())
	vals = set(new_outputs.values())
	# checks through each pixel; if within modification range, change value 
	# of color (r, g, or b) according to new_outputs
	pixel_index = 0
	if color == 'r':
		rgb_ind = 0
	elif color == 'b':
		rgb_ind = 1
	else:
		rgb_ind = 2
	for pix in newImage['pixels']:
		if pix[rgb_ind] in keys:
			newImage['pixels'][pixel_index] = list(newImage['pixels'][pixel_index])
			newImage['pixels'][pixel_index][rgb_ind] = new_outputs[pix[rgb_ind]]
			newImage['pixels'][pixel_index] = tuple(newImage['pixels'][pixel_index])
		pixel_index += 1
	return newImage

def color_filter_from_greyscale_filter(filt):
	"""
	Given a filter that takes a greyscale image as input and produces a
	greyscale image as output, returns a function that takes a color image as
	input and produces the filtered color image.
	"""
	def apply_filter(image):
		# makes a greyscale image for each RGB channel  
		redList, greenList, blueList = zip(*(image["pixels"]))
		red = {k:v for k,v in image.items()}
		green = {k:v for k,v in image.items()}
		blue = {k:v for k,v in image.items()}
		red["pixels"] = list(redList)
		green["pixels"] = list(greenList)
		blue["pixels"] = list(blueList)

		# applies filter to each of the images
		red = filt(red)
		green = filt(green)
		blue = filt(blue)

		# creates copy of image and replaces pixles with filtered pixels
		newImage = {k:v for k,v in image.items()}
		newImage["pixels"] = list(zip(red["pixels"], green["pixels"], blue["pixels"]))
		return newImage
	return apply_filter


def make_blur_filter(n):
	def blur_filter(image):
		return blurred(image, n)
	return blur_filter


def make_sharpen_filter(n):
	def sharpen_filter(image):
		return sharpened(image, n)
	return sharpen_filter


def filter_cascade(filters):
	"""
	Given a list of filters (implemented as functions on images), returns a new
	single filter such that applying that filter to an image produces the same
	output as applying each of the individual ones in turn.
	"""
	def apply_filters(image):
		# applies each filter from filters onto image and returns the final image
		newImage = {k:v for k,v in image.items()}
		for filt in filters:
			newImage = filt(newImage)
		return newImage
	return apply_filters


# SEAM CARVING

# Main Seam Carving Implementation

def seam_carving(image, ncols):
	"""
	Starting from the given image, use the seam carving technique to remove
	ncols (an integer) columns from the image.
	"""
	newImage = {
		'height': image['height'],
		"width": image["width"],
		"pixels": image["pixels"][:],
	}
	for cycle in range(ncols):
		grey = greyscale_image_from_color_image(newImage)
		energy = compute_energy(grey)
		cem = cumulative_energy_map(energy)
		min_energy_seam = minimum_energy_seam(cem)
		newImage = image_without_seam(newImage, min_energy_seam)
	return newImage


# Optional Helper Functions for Seam Carving

def greyscale_image_from_color_image(image):
	"""
	Given a color image, computes and returns a corresponding greyscale image.

	Returns a greyscale image (represented as a dictionary).
	"""
	# replaces each pixel value with the new value given by an algo
	newImage = {k:v for k,v in image.items()}
	newPixels = [round(0.299 * r + 0.587 * g + 0.114 * b) for (r,g,b) in image["pixels"]]
	newImage["pixels"] = newPixels
	return newImage


def compute_energy(grey):
	"""
	Given a greyscale image, computes a measure of "energy", in our case using
	the edges function from last week.

	Returns a greyscale image (represented as a dictionary).
	"""
	return edges(grey)


def cumulative_energy_map(energy):
	"""
	Given a measure of energy (e.g., the output of the compute_energy
	function), computes a "cumulative energy map" as described in the lab 2
	writeup.

	Returns a dictionary with 'height', 'width', and 'pixels' keys (but where
	the values in the 'pixels' array may not necessarily be in the range [0,
	255].
	"""
	width = energy["width"]
	height = energy["height"]
	energy_map = {k:v for k,v in energy.items()}
	# copies the first row
	energy_map["pixels"] = list(energy["pixels"][:width])
	# add the minimum adjacent value to the current energy value
	for row in range(1, height):
		for col in range(width):
			energy_value = get_pixel(energy, col, row) + get_adjacent_min(get_adjacent_pix(energy_map, col, row), energy_map)
			energy_map["pixels"].append(energy_value)
	return energy_map

def get_adjacent_pix(energy_map, col, row):
	"""
	Given the energy map, column, and row, returns the possible adjacent pixels
	as a tuple (column, row)
	"""
	width = energy_map["width"]
	height = energy_map["height"]
	adjacent_pixels = [(c, r) for c, r in [(col - 1, row - 1), (col, row - 1), (col + 1, row - 1)] \
		if 0 <= c < width and 0 <= r < height]
	return adjacent_pixels

def get_pixel_index(image, col, row):
	"""
	Returns the index of the pixel given it's (x, y) location and the image
	"""
	return row * image['width'] + col

def pix_to_col_row(width, pix):
	"""
	Returns the (x, y) position of the pixel given the pixel index and the 
	width of the image
	"""
	row = pix // width
	col = pix % width
	return (col, row)

def get_adjacent_min(adjacent_pixels, energy_map):
	"""
	Given the adjacent pixels and energy map, returns the minimum of the 
	given adjacent pixels
	"""
	adjacent_values = []
	for pix in adjacent_pixels:
		adjacent_values.append(get_pixel(energy_map, *pix))
	return min(adjacent_values)

def minimum_energy_seam(cem):
	"""
	Given a cumulative energy map, returns a list of the indices into the
	'pixels' list that correspond to pixels contained in the minimum-energy
	seam (computed as described in the lab 2 writeup).
	"""
	width = cem["width"]
	row = cem["height"]
	seam = []
	# finds the minimum energy value of the last row and saves its pixel index
	last_row = cem["pixels"][width * (row - 1):]
	pix = last_row.index(min(last_row)) + width * (row - 1) 
	seam.append(pix)
	row -= 1
	# from bottom up, finds the lowest adjacent value and saves it
	while (row - 1 >= 0):
		adjacent_pix = get_adjacent_pix(cem, *pix_to_col_row(width, pix))
		lowest = get_adjacent_min(adjacent_pix, cem)
		# make a list of adjacent values
		adjacent_slice = [get_pixel(cem, *pixel) for pixel in adjacent_pix]
		# find its pixel index by adding the pixel index of the first adjacent value 
		# to the index of the lowest in adjacent_slice
		pix = get_pixel_index(cem, *adjacent_pix[0]) + adjacent_slice.index(lowest)
		seam.append(pix)
		row -= 1
	return seam


def image_without_seam(image, seam):
	"""
	Given a (color) image and a list of indices to be removed from the image,
	return a new image (without modifying the original) that contains all the
	pixels from the original image except those corresponding to the locations
	in the given list.
	"""
	newImage = {k:v for k,v in image.items()}
	for ind in seam:
		newImage["pixels"].pop(ind)
	newImage["width"] -= 1
	return newImage


def get_pixel(image, x, y):
	# if x and y are greater than the width and height respectively, 
	# set them to the width/height
	# else if they're less than 0, set them to 0
	if (x >= image['width']):
		x = image['width'] - 1
	elif (x < 0):
		x = 0
	if (y >= image['height']):
		y = image['height'] - 1
	elif (y < 0):
		y = 0
	return image['pixels'][y * image['width'] + x]



def set_pixel(image, x, y, c):
	"""
	Sets the value of pixel at x, y to c
	"""
	image['pixels'][y * image['width'] + x] = c


def apply_per_pixel(image, func):
	# copy of image to return
	result = {
		'height': image['height'],
		'width': image['width'],
		'pixels': image['pixels'][:],
	}
	# find the new value of each pixel and apply it to result
	for y in range(image['height']):
		for x in range(image['width']):
			color = get_pixel(image, x, y)
			newcolor = func(color)
			set_pixel(result, x, y, newcolor)
	return result


def inverted(image):
	return apply_per_pixel(image, lambda c: 255-c)


# HELPER FUNCTIONS

def correlate(image, kernel):
	"""
	Compute the result of correlating the given image with the given kernel.

	The output of this function should have the same form as a 6.009 image (a
	dictionary with 'height', 'width', and 'pixels' keys), but its pixel values
	do not necessarily need to be in the range [0,255], nor do they need to be
	integers (they should not be clipped or rounded at all).

	This process should not mutate the input image; rather, it should create a
	separate structure to represent the output.

	The kernel will be represented as a 1D list like image["pixels"]
		This will make zipping a lot easier
	"""
	# copy of image 
	newImage = {
		'height': image['height'],
		"width": image["width"],
		"pixels": image["pixels"][:],
	}
	kernelSize = int(len(kernel) ** .5)
	for x in range(image["width"]):
		for y in range(image["height"]):
			# set the starting pixel to the upper left corner of the kernel frame
			x2 = x - kernelSize // 2
			y2 = y - kernelSize // 2
			framePixels = []
			# append the pixel values of the frame to a list
			for y1 in range(y2, y2 + kernelSize):
				for x1 in range(x2, x2 + kernelSize):
					framePixels.append(get_pixel(image, x1, y1))
			# apply the kernel onto the list and change the values of newImage accordingly
			newPixels = [i*j for (i, j) in zip(kernel, framePixels)]
			set_pixel(newImage, x, y, sum(newPixels))
	return newImage


def round_and_clip_image(image):
	"""
	Given a dictionary, ensure that the values in the 'pixels' list are all
	integers in the range [0, 255].

	All values should be converted to integers using Python's `round` function.

	Any locations with values higher than 255 in the input should have value
	255 in the output; and any locations with values lower than 0 in the input
	should have value 0 in the output.
	"""
	l = image["pixels"]
	for i in range(len(image["pixels"])):
		if (l[i] < 0):
			l[i] = 0
		elif (l[i] > 255):
			l[i] = 255
		l[i] = round(l[i])


# FILTERS

def blurred(image, n):
	"""
	Return a new image representing the result of applying a box blur (with
	kernel size n) to the given input image.

	This process should not mutate the input image; rather, it should create a
	separate structure to represent the output.
	"""
	# first, create a representation for the appropriate n-by-n kernel (you may
	# wish to define another helper function for this)
	kernel = nnKernel(n)

	# then compute the correlation of the input image with that kernel
	newImage = correlate(image, kernel)
	round_and_clip_image(newImage)
	return newImage
	# and, finally, make sure that the output is a valid image (using the
	# helper function from above) before returning it.

def nnKernel(n):
	"""
	Creates a kernel that is an n x n square of identical values that sum to 1
	"""
	a = 1/(n**2)
	return [a] * n**2

def sharpened(image, n):
	"""
	Return a new image representing the result of applying a sharpen filter
	(with blur box of kernel size n) to the given input image

	This process does not mutate the input image and instead creates and 
	returns a separate structure to represent the output
	"""
	blurredImage = blurred(image, n)
	newImage = {
		"height": image["height"],
		"width": image["width"],
		"pixels": image["pixels"][:]
	}
	# the value of each new pixel follows the following calculation:
	# Sxy = 2Ixy - Bxy
	for i in range(len(newImage["pixels"])):
		newImage["pixels"][i] = 2*newImage["pixels"][i] - blurredImage["pixels"][i]
	round_and_clip_image(newImage)
	return newImage

def edges(image):
	"""
	Return a new image representing the result of applying the edges filter
	(Sobel operator) which should make the image's edges look more emphasized

	This process does not mutate the input image and instead creates and 
	returns a separate structure to represent the output
	"""
	# Initializes lists for the two kernels and two new images with one of the two
	# kernels applied
	kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
	kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
	newImage1 = correlate(image, kernelX)
	newImage2 = correlate(image, kernelY)
	# adds the new pixel values to a list
	l = []
	for i in range(len(image["pixels"])):
		x = newImage1["pixels"][i]
		y = newImage2["pixels"][i]
		l.append(round(math.sqrt(x*x + y*y)))
	newImage = {
		"height": image["height"],
		"width": image["width"],
		"pixels": l#[round(math.sqrt(x*x + y*y)) for (x, y) in 
								#zip(newImage1["pixels"], newImage2["pixels"])],
	}
	round_and_clip_image(newImage)
	return newImage


# HELPER FUNCTIONS FOR LOADING AND SAVING COLOR IMAGES

def load_color_image(filename):
	"""
	Loads a color image from the given file and returns a dictionary
	representing that image.

	Invoked as, for example:
	   i = load_color_image('test_images/cat.png')
	"""
	with open(filename, 'rb') as img_handle:
		img = Image.open(img_handle)
		img = img.convert('RGB')  # in case we were given a greyscale image
		img_data = img.getdata()
		pixels = list(img_data)
		w, h = img.size
		return {'height': h, 'width': w, 'pixels': pixels}


def save_color_image(image, filename, mode='PNG'):
	"""
	Saves the given color image to disk or to a file-like object.  If filename
	is given as a string, the file type will be inferred from the given name.
	If filename is given as a file-like object, the file type will be
	determined by the 'mode' parameter.
	"""
	out = Image.new(mode='RGB', size=(image['width'], image['height']))
	out.putdata(image['pixels'])
	if isinstance(filename, str):
		out.save(filename)
	else:
		out.save(filename, mode)
	out.close()


def load_greyscale_image(filename):
	"""
	Loads an image from the given file and returns an instance of this class
	representing that image.  This also performs conversion to greyscale.

	Invoked as, for example:
	   i = load_greyscale_image('test_images/cat.png')
	"""
	with open(filename, 'rb') as img_handle:
		img = Image.open(img_handle)
		img_data = img.getdata()
		if img.mode.startswith('RGB'):
			pixels = [round(.299 * p[0] + .587 * p[1] + .114 * p[2])
					  for p in img_data]
		elif img.mode == 'LA':
			pixels = [p[0] for p in img_data]
		elif img.mode == 'L':
			pixels = list(img_data)
		else:
			raise ValueError('Unsupported image mode: %r' % img.mode)
		w, h = img.size
		return {'height': h, 'width': w, 'pixels': pixels}


def save_greyscale_image(image, filename, mode='PNG'):
	"""
	Saves the given image to disk or to a file-like object.  If filename is
	given as a string, the file type will be inferred from the given name.  If
	filename is given as a file-like object, the file type will be determined
	by the 'mode' parameter.
	"""
	out = Image.new(mode='L', size=(image['width'], image['height']))
	out.putdata(image['pixels'])
	if isinstance(filename, str):
		out.save(filename)
	else:
		out.save(filename, mode)
	out.close()


if __name__ == '__main__':
	# code in this block will only be run when you explicitly run your script,
	# and not when the tests are being run.  this is a good place for
	# generating images, etc.
	# cat = load_color_image("test_images/cat.png")
	# catInverse = color_filter_from_greyscale_filter(inverted)(cat)
	# save_color_image(catInverse, "test_results/cat_inverted.png")
	# python = load_color_image("test_images/python.png")
	# pythonBlurred = color_filter_from_greyscale_filter(make_blur_filter(9))(python)
	# save_color_image(pythonBlurred, "test_results/python_blurred.png")
	# sparrowchick = load_color_image("test_images/sparrowchick.png")
	# sparrowchickSharpened = color_filter_from_greyscale_filter(make_sharpen_filter(7))(sparrowchick)
	# save_color_image(sparrowchickSharpened, "test_results/sparrowchickSharpened.png")
	# filter1 = color_filter_from_greyscale_filter(edges)
	# filter2 = color_filter_from_greyscale_filter(make_blur_filter(5))
	# filt = filter_cascade([filter1, filter1, filter2, filter1])
	frog = load_color_image("test_images/frog.png")
	# frogCascade = filt(frog)
	# save_color_image(frogCascade, "test_results/frog_cascade.png")
	twocats = load_color_image("test_images/twocats.png")
	twocats_seamcarved = seam_carving(twocats, 100)
	save_color_image(twocats_seamcarved, "test_results/twocats_seamcarved.png")
	frog_curve = color_curve(frog, 'r', 20, 190, 0.1)
	save_color_image(frog_curve, 'test_results/frog_color_curve.png')