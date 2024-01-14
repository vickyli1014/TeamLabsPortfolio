/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Rect } from '../src/Rect';
import * as utils from '../src/utils';

/**
 * Tests for utility functions in `utils.ts`.
 */

// PS2 instructions: this test is an example, feel free to delete it.
describe('isSquare', function() {
    it('empty rectangle should be square', function() {
        assert(utils.isSquare(new Rect(4, 5, 4, 5)));
    });
});
