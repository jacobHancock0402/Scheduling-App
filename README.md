# Scheduling-App
A scheduling app based on active recall, spaced repetition and retrospective timetables

This is a personal project with a sole purpose of helping me schedule my schoolwork, thus I do not intend on launching the app, so the app is very raw visually and buggy

It has a folder system where each folder can have folders within it, which those folders can then have folders within themselves. This allows me complete freedom in how i like to order my different topics and subtopics. The implentation is very simple, relying on a single array of objects, which are categorised as either a a folder or topic(like a file) depending on wether they have children

The other main feature is the color system of the topics. This is a very simple way to convey how co***REMOVED***ortable I am with a topic, and when I should go over it again. It doesn't follow any spaced repetittion algorithm, this is mainly because the app is meant to be more of a guideline, so the decay didn't have to be very accurate, so it pretty much just decreases the green value and increase red value of the colour as time passes. If i had gone with this approach, I more than likely would have had to sacrifice the ability to grade yourself on a slide, and thus probably go for a more basic visual system that most other similarly purposed apps adapt, rather than a complete gradient of colours from bright green to bright red, which is more appealing to me for a quick indicator of where I'm at. Also, of course I would probably come across more difficulties in trying to create the app in this manner. 

For the rest of the app, it mainly hinges upon react-native libraries i.e navigation, slider and asyncStorage, with the latter perhaps being deprectated as this point(?), so this might be something to look at in future, as I have lost data once or twice.


![Some Text](img.png)
