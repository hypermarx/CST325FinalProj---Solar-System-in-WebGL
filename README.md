### CST325 Final Project - Eashwar Sridharan

# How to Run

Simply  make sure you are in the project directory and run "http-server" on the console, then open one of the available links.
# Controls

**PRESS E** to toggle the camera between sun-orbiting and Earth-following.

**PRESS W and S** to increase and decrease the flow of time in the scene. I didn't let it go negative because
you probably practically wouldn't want that, but it in theory would work if you removed the Math.max call.

In Earth-following camera mode, **press A and D** to toggle which planet you are following. Any planet can be followed (so not the moon).

**PRESS Q** to toggle the skybox to make it easier to spot the tiny planets.

# Details

I used a quad that the camera is always looking at with a cubemap texture as the skybox,
which prevents parts of the skybox from being visibly further away from the camera than others.

I tried to do relative scales, but they don't exactly line up
because of how massive the gap between planets would be. A lot of the
rotations, orbit speeds, and scales were made somewhat
relative to what I made the scales between the Sun and Mercury, but Mercury is 
larger than it would be to scale because otherwise it would be essentially invisible.
As a result, the moon's distance
to the Earth, for example, doesn't really fit the scale I found searching of "you could on average fit 30 earths 
in this gap", because both are too large for that to stick. However, the planets
all being scaled relative to Mercury eventually made Jupiter bigger than the sun.
As such, I made the sun larger and increased all the distances, and the camera also starts further out and can zoom much further out.

I think a more accurate solar system model would certainly be possible and fun to make,
but would have required very extensive time put into the precision of the measurements,
and the distance and size disparities would make it essentially impossible to truly  observe all the planets at once; Which 
goes without saying because that would be accurate to real life, too.

### Other extra credits:
-Made Earth rotate on its axis\
-Used specular map on Earth\
-Moon and Earth cast shadows on one another.