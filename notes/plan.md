# How to get animated backgrounds

## get the number of slots in an arena

1. walk all the way to the left, pause, and tag the leftmost sprite
2. walk all the way to the right, pause, and tag the rightmost sprite

the arena width is (rightmost.x + 16) - leftmost.x

the number of slots is equal to arenaWidth / 16

## fill the slots with background sprites

as needed, based on width of arena

pause, tag sprites as belonging to a given slot

## determine auto animation speed, determine length of background animation

read neo geo memory and figure out what the speed of the animation is for this background, save it

the length of the animation is duration of one frame * 8

## save all info on the slotted sprites

for every sprite that got put into a slot (and there will often be more than one in a given slot), save their
entire video ram data structure

## create animation frames

with all slotted sprites and all of their data saved:

prep: set time to zero, set animation counter to zero

for (let gifTime = 0; gifTime < totalAnimationLength; gifTime += gifFrameDuration) {
    update clock
    determine current animation counter value
    iterate over all sprites and render into a frame, using current animation counter to determine auto animation frame
}

with all frames in hand, use gifshot to create an animated gif

save gif to disk



