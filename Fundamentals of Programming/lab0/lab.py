# No Imports Allowed!


def backwards(sound):
    raise NotImplementedError


def mix(sound1, sound2, p):
    raise NotImplementedError


def echo(sound, num_echos, delay, scale):
    raise NotImplementedError


def pan(sound):
    raise NotImplementedError


def remove_vocals(sound):
    raise NotImplementedError


# below are helper functions for converting back-and-forth between WAV files
# and our internal dictionary representation for sounds

import io
import wave
import struct

def load_wav(filename):
    """
    Given the filename of a WAV file, load the data from that file and return a
    Python dictionary representing that sound
    """
    f = wave.open(filename, 'r')
    chan, bd, sr, count, _, _ = f.getparams()

    assert bd == 2, "only 16-bit WAV files are supported"

    left = []
    right = []
    for i in range(count):
        frame = f.readframes(1)
        if chan == 2:
            left.append(struct.unpack('<h', frame[:2])[0])
            right.append(struct.unpack('<h', frame[2:])[0])
        else:
            datum = struct.unpack('<h', frame)[0]
            left.append(datum)
            right.append(datum)

    left = [i/(2**15) for i in left]
    right = [i/(2**15) for i in right]

    return {'rate': sr, 'left': left, 'right': right}


def write_wav(sound, filename):
    """
    Given a dictionary representing a sound, and a filename, convert the given
    sound into WAV format and save it as a file with the given filename (which
    can then be opened by most audio players)
    """
    outfile = wave.open(filename, 'w')
    outfile.setparams((2, 2, sound['rate'], 0, 'NONE', 'not compressed'))

    out = []
    for l, r in zip(sound['left'], sound['right']):
        l = int(max(-1, min(1, l)) * (2**15-1))
        r = int(max(-1, min(1, r)) * (2**15-1))
        out.append(l)
        out.append(r)

    outfile.writeframes(b''.join(struct.pack('<h', frame) for frame in out))
    outfile.close()

def backwards(sound):
    newSound = {
        "rate": sound["rate"],
        "left": list(reversed(sound['left'])),
        "right": list(reversed(sound['right']))
    }
    return newSound

def mix(sound1, sound2, p):
    if (sound1["rate"] != sound2["rate"]):
        return None
    length = len(sound1['left'])
    if (len(sound1['left']) != len(sound2['left'])):
        length = min(len(sound1['left']), len(sound2['left']))

    left1 = map(lambda x: p*x, sound1["left"][:length])
    left2 = map(lambda x: (1-p)*x, sound2["left"][:length])
    right1 = map(lambda x: p*x, sound1["right"][:length])
    right2 = map(lambda x: (1-p)*x, sound2["right"][:length])
    newSound = {
        "rate": sound1["rate"],
        "left": [x + y for (x, y) in zip(left1, left2)],
        "right": [x + y for (x, y) in zip(right1, right2)]
    }
    return newSound

def echo(sound, num_echos, delay, scale): 
    sample_delay = round(delay * sound["rate"])
    left = sound["left"]
    right = sound["right"]
    for i in range(1, num_echos+1):
        leftTemp = [0]*(sample_delay*i)
        leftTemp += map(lambda x: x*(scale**i), sound["left"])
        left = left + [0]*(len(leftTemp)-len(left))
        left = [x + y for (x, y) in zip(leftTemp, left)]

        rightTemp = [0]*(sample_delay*i)
        rightTemp += map(lambda x: x*(scale**i), sound["right"])
        right = right + [0]*(len(rightTemp)-len(right))
        right = [x + y for (x, y) in zip(rightTemp, right)]
    newSound = {
        "rate": sound["rate"],
        "left": left,
        "right": right
    }
    return newSound

def pan(sound):
    n = len(sound["left"])
    left = []
    right = []
    for i in range(n):
        left.append(sound["left"][i] * (1 - i/(n-1)))
        right.append(sound["right"][i] * (i/(n-1)))
    newSound = {
        "rate": sound["rate"],
        "left": left,
        "right": right
    }
    return newSound

def remove_vocals(sound):
    left = sound["left"]
    right = sound["right"]
    difference = [x - y for (x, y) in zip(left, right)]
    newSound = {
        "rate": sound["rate"],
        "left": difference,
        "right": difference
    }
    return newSound

if __name__ == '__main__':
    # code in this block will only be run when you explicitly run your script,
    # and not when the tests are being run.  this is a good place to put your
    # code for generating and saving sounds, or any other code you write for
    # testing, etc.

    # here is an example of loading a file (note that this is specified as
    # sounds/hello.wav, rather than just as hello.wav, to account for the
    # sound files being in a different directory than this file)
    # hello = load_wav('sounds/hello.wav')
    # mystery = load_wav('sounds/mystery.wav')
    # write_wav(backwards(mystery), 'mysteryReversed.wav')
    # write_wav(backwards(hello), 'hello_reversed.wav')
    # synth = load_wav("sounds/synth.wav")
    # water = load_wav("sounds/water.wav")
    # write_wav(mix(synth, water, 0.2), "synthwater.wav")
    # chord = load_wav("sounds/chord.wav")
    # write_wav(echo(chord, 5, 0.3, 0.6), "sounds/chordEcho.wav")
    # car = load_wav("sounds/car.wav")
    # write_wav(pan(car), "sounds/carPan.wav")
    coffee = load_wav("sounds/coffee.wav")
    write_wav(remove_vocals(coffee), "sounds/coffeeRemoved.wav")