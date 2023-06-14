usage
- for the progress bar: 
    all is loaded in automatically. The prgress bar uses data-page-name field on the sc-page section elements to name the markers (or you can turn them off by specifying pageNamesInProgressBar to false in the config.json)


defining a new page:
- use a section element directly under <main> and give it the class name: sc-page
- for all animated elements: all inside of sc-page elements, name the element sc-element
- there are predefined styles for sc-elements
    - from-top, left, bottom, right, small, fade in
- you can also define your styles
    - in styles.css define all active styles as .sc-page.active .sc-element{element-classname} 
    - in styles.css define all active styles as .sc-page.inactive .sc-element{element-classname} 

config properties
- addedScroll: extra number of pixel scroll that should be added to each page
- allowArrowNav: allow navigation of arrow keys
- 