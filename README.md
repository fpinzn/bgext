#bgext

Concept Test on background extraction.

##proto1

__What:__ Test using JSFeat's Lukas-Kanade Optical Flow Algorithm to see what happens (from now on abbreviated as &swh).

__How:__ The prototype consists of a clickable video, where each click determines a point to be followed by the algorithm. When the tracked point is "lost", said tracking stops.

__Then:__ The results are mixed. Given the restrictions of the algorithm:

"it cannot provide flow information in the interior of uniform regions of the image."

From: http://en.wikipedia.org/wiki/Lucas%E2%80%93Kanade_method

The algorithm is more suited for real-life videos an not quite for cartoons, nevertheless I'll perform other tests.

##proto2

__What:__ Use the Lukas-Kanade algorithm with a defined pattern of points and record their motion and see what happens.  Test using JSFeat's Lukas-Kanade Optical Flow Algorithm &swh.

__Then:__
