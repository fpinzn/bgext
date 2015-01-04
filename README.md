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

__Then:__ Even when the algorithm is supposedly not performant in large solid areas, the fact that the experiment replaces the non followed points with new points placed randomly displays potential to identify the elements that move independently from others.

##proto3

__What:__ draw a voronoi diagram using the dataset from before &swh.

__Then:__ The voronoi diagram on top doesn't seem like an usable partition. Nevertheless it makes me think about the usage of the Lukas-Kanade Algorithm using non rectangular regions. The slider to change the number of points doesn't seem to work and the code is a horrible frankenstein I don't want to fix. Next experiment starts from scratch.

##proto4
