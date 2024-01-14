#!/usr/bin/env python3

import math

from PIL import Image as Image

# NO ADDITIONAL IMPORTS ALLOWED!


def get_pixel(image, x, y):
    # if x and y are greater than the width and height respectively, 
    # set them to the width/height
    # else if they're less than 0, set them to 0
	# if (x >= image['width']):
	# 	x = image['width'] - 1
	# elif (x < 0):
	# 	x = 0
	# if (y >= image['height']):
	# 	y = image['height'] - 1
	# elif (y < 0):
	# 	y = 0
	return image['pixels'][y * image['width'] + x]
    # bug: list does not take x,y



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
        'pixels': image['pixels'][:], # made a copy of pixels list
    }
    # find the new value of each pixel and apply it to result
    for y in range(image['height']): # changed x and y to width and height respectively
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

# HELPER FUNCTIONS FOR LOADING AND SAVING IMAGES

def load_image(filename):
    """
    Loads an image from the given file and returns a dictionary
    representing that image.  This also performs conversion to greyscale.

    Invoked as, for example:
       i = load_image('test_images/cat.png')
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


def save_image(image, filename, mode='PNG'):
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
    # bluegill = load_image('test_images/bluegill.png')
    # save_image(inverted(bluegill), "test_images/bluegillInverted.png")
    # pigbird = load_image("test_images/pigbird.png")
    # kernel = [0, 0, 0, 0, 0, 0, 0, 0, 0,
				# 0, 0, 0, 0, 0, 0, 0, 0, 0,
				# 1, 0, 0, 0, 0, 0, 0, 0, 0,
				# 0, 0, 0, 0, 0, 0, 0, 0, 0,
				# 0, 0, 0, 0, 0, 0, 0, 0, 0,
				# 0, 0, 0, 0, 0, 0, 0, 0, 0,
				# 0, 0, 0, 0, 0, 0, 0, 0, 0,
				# 0, 0, 0, 0, 0, 0, 0, 0, 0,
				# 0, 0, 0, 0, 0, 0, 0, 0, 0]
    # save_image(round_and_clip_image(correlate(pigbird, kernel)), "test_images/pigbirdCorrelate.png")
	# cat = load_image("test_images/cat.png")
	# save_image(round_and_clip_image(blurred(cat, 5)), "test_images/catBlurred.png")
	# python = load_image("test_images/python.png")
	# save_image(sharpened(python, 11), "test_images/pythonSharpened.png")
	# pic = load_image("test_images/centered_pixel.png")
	construct = load_image("test_images/construct.png")
	#save_image(correlate(construct, kernel), "test_images/constructEdges.png")
	save_image(edges(construct), "test_images/constructEdges.png")
	