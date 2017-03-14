---
post_title: Creating an improved build status page for TFS 2015 with Knockout.js and Bootstrap
sitemap: false
---

When transitioning 200-300 build definitions from XAML to vNext, my primary concern was, naturally, making sure the new builds worked consistently. The build overview page built-in to TFS 2015 displays all the builds that have run for a particular team project, in the order they were run. However, when you have multiples of some builds, and others that haven't built recently, it becomes difficult to track which builds need some TLC. I needed a way to quickly view the status of the latest build from each definition, preferably without adding too much extra development time to an already overdue project.

This post acts as something of a walkthrough of creating a custom build status page. It assumes a basic knowledge of Knockout.js, Bootstrap, and jQuery Ajax, and I don't intend for it to be a step-by-step guide, more of an explanation of my thought process in creating the page. For more information, view the [mockup](/vNextBuilds), or the full [javascript](https://gist.github.com/Kujawadl/ee7e0d1a21b1e993eb967677ca23f143) and [html](https://gist.github.com/Kujawadl/4094714b43c0c60230b67848f5789a26) source.

<div class="ui mini message">
  <div class="ui header">
    A quick note about authentication
  </div>
  <p>
    On-prem TFS 2015 does not support OAuth tokens; the REST APIs used in this page rely on NTLM authentication, which unfortunately cannot be used in combination with CORS requests in jQuery Ajax.
  </p>
  <p>
    To get around this, you could wrap this page as an extension to TFS, however, the simplest way to get it working is to just serve it as a static html page from the same server.
  </p>
</div>

### Creating the view model

First, let's get a list of team projects:

```javascript
/**
 * @typedef {object} BuildsViewModel
 *
 * @property {TeamProject[]}    projects                A list of TeamProjects, retrieved from the REST apis.
 * @property {Build}            detailBuild             A specific Build object to be singled out for a detailed view, e.g. a modal .
 * @property {string}           lastUpdate()            The last time projects were hard refreshed, represented as a formatted string.
 * @property {boolean}          isLoading()             Whether any TeamProjects or Builds are (re)loading.
 * @property {number}           numBuilds()             The total number of build definitions across all projects.
 * @property {number}           numFailing()            The number of builds that are failing across all projects.
 *
 * @property {void}             loadProjects()          Load all projects.
 * @property {void}             refresh()               Refreshes all TeamProject objects by clearing their builds and re-loading from scratch. Must be done to pick up new build definitions.
 * @property {void}             autoRefresh(boolean)    Sets whether the view model should automatically refresh. If so, a hard refresh is performed every 30 minutes, and a soft refresh every 5.
 * @property {void}             setDetailBuild(Build)   Singles out a specific Build object for a detailed view.
 */
function BuildsViewModel() {
  var self = this;
  ...
  self.loadProjects = function () {
      $.ajax({
          url: "http://{TFS_Server}/tfs/DefaultCollection/_apis/projects?api-version=2.0",
          type: "GET",
          contentType: "application/json",
          accepts: "application/json",
          cache: false,
          xhrFields: {
              withCredentials: true
          },
          complete: function (data) {
              data.responseJSON.value.forEach(function (p, i) {
                  self.projects.push(new TeamProject(p.name));
                  self.projects(self.projects().sort(function (l, r) { return l.name.toLowerCase() > r.name.toLowerCase() ? 1 : -1; }));
              });
          }
      });
  }
  ...
  self.loadProjects();
}
```

The name of each team project is passed to the constructor of a TeamProject object:

```javascript
/**
 * @typedef  {object}   TeamProject
 * @param    {string}   name                        The TeamProject name; remaining information will be loaded through a RESTful API
 *
 * @property {string}   name                        The TeamProject name, e.g. ConsolePrograms
 * @property {Build[]}  builds()                    The latest build from each of the project's vNext build definitions
 * @property {number}   numBuilds()                 The total number of vNext build definitions in this project
 * @property {number}   numFailing()                The total number of failing vNext builds in this project
 * @property {boolean}  isLoading()                 Whether the build information is currently (re)loading
 *
 * @property {void}     loadBuilds()                Loads build information for this team project
 * @property {void}     addBuild(number, string)    Instantiates a new Build object and adds it to this projects list of builds
 * @property {void}     refresh()                   Destroys the current list of builds and reloads it from scratch
 */
function TeamProject(name) {
    var self = this;
    ...
    self.loadBuilds = function () {
        self._loadingBuilds(true);
        $.ajax({
            url: "http://{TFS_Server}/tfs/DefaultCollection/" + self.name + "/_apis/build/definitions?api-version=2.0",
            type: "GET",
            contentType: "application/json",
            accepts: "application/json",
            cache: false,
            xhrFields: {
                withCredentials: true
            },
            complete: function (data) {
                data.responseJSON.value.forEach(function (d, i) {
                    if (d.type !== "xaml") { self.addBuild(d.id, d.name); }
                });
                self._loadingBuilds(false);
            }
        });
    }
    ...
    self.refresh = function () {
        self.builds([]);
        self.loadBuilds();
    }
    self.refresh();
}
```

Each team project then gets a list of all of its non-XAML build definitions, and populates a list of Build objects with the following properties:

```javascript
/**
 * @typedef {object} Build
 * @param {string}      teamProject         The TeamProject name
 * @param {number}      definitionId        The unique build definition identifier
 * @param {string}      name                The name of the build definition
 *
 * @property {string}   teamProject         The TeamProject name
 * @property {number}   definitionId        The unique build definition identifier
 * @property {string}   name                The name of the build definition
 * @property {string}   definitionLink()    A link to the build definition
 * @property {number}   latestBuildId()     The unique build identifier
 * @property {string}   latestBuildLink()   A link to the latest build
 * @property {string}   latestBuildNumber() The latest build number
 * @property {string}   latestBuildDate()   The date of the latest build, represented as a pre-formatted string
 * @property {string}   brokenSince()       The date the build first broke (if it's currently failing, otherwise empty string)
 * @property {number}   changeSet()         If failing, the ChangeSet that broke the build; otherwise, the changeset that triggered the latest build
 * @property {string}   badgeSrc()          A link to the build status badge (img src)
 * @property {string}   status()            The status of the latest build: enum { succeeded, partiallySucceeded, canceled, failed }
 * @property {string[]} errors ()           A list of build errors, if any
 * @property {boolean}  isLoading()         Whether the build information is currently (re)loading
 *
 * @property {void}     loadDefinition()    Loads definition information for this build
 * @property {void}     loadLatestBuild()   Loads the latest build's information, such as status and build number
 * @property {void}     refresh()           Refreshes all information about this build
 */
 ```

### Knockout

Most of the properties of the TeamProject and Build objects are actually implemented as Knockout observables:

```javascript
self.latestBuildId = ko.observable(0);
self.definitionLink = ko.observable("");
self.latestBuildLink = ko.observable("");
self.latestBuildNumber = ko.observable("");
self.latestBuildDate = ko.observable("");
self.brokenSince = ko.observable("");
self.changeSet = ko.observable("");
self.badgeSrc = ko.observable("");
self.status = ko.observable("");
```

These observables get set in the callback of the REST API. However, it's nice to have some way of knowing whether the page has finished loading. To do so, we create a couple of observable boolean objects that will be set when a Build is finished loading, and a computed value that combines them:

```javascript
self._loadingDefinition = ko.observable(true);
self._loadingBuild = ko.observable(true);
self.isLoading = ko.computed(function () {
    return self._loadingBuild() || self._loadingDefinition();
});
```

The `isLoading()` function in the TeamProject objects is similar. However, the builds will continue to load after the team project is finished making its API calls. To account for this, we need to create consider the project loading if it's waiting for it's callback to finish, *or* if any of its builds are waiting for callbacks:

```javascript
self._loadingBuilds = ko.observable(true);
self.isLoading = ko.computed(function () {
    return (self._loadingBuilds() || self.builds().reduce(function (a, build) {
        if (build.isLoading()) { a = true; }
        return a;
    }, false));
});
```

### Displaying the builds

Using Bootstrap, we can create a tab for each team project, and a table containing the build information. A custom sort function places failing builds at the top, and a css data-bind attribute marks them with the `danger` class so they're highlighted in red:

{% include image.html src="/assets/images/vNextBuilds/Screenshots/Overview.PNG" alt="The build status page" centered="true" imgsize="fluid bordered" %}

While it's nice to have failing builds highlighted up top, I'd much rather see all builds passing:

{% include image.html src="/assets/images/vNextBuilds/Screenshots/Success.PNG" alt="All builds passing" centered="true" imgsize="fluid bordered" %}

The page can fairly easily be made mobile-friendly by hiding less important information as the screen size drops:

<div class="ui basic center aligned segment">
  <div class="ui medium images">
    {% include image.html src="/assets/images/vNextBuilds/Screenshots/Tablet.PNG" alt="Tablet view" imgsize="bordered" %}
    {% include image.html src="/assets/images/vNextBuilds/Screenshots/Mobile.PNG" alt="Mobile view" imgsize="bordered" %}
  </div>
</div>

### Monitoring status changes

Using a Knockout computed observable, we can create a Chrome notification whenever a build's status changes. The computed function first makes a call to the build's `isLoading()` function, so Knockout will handle the event bindings to ensure it runs after every refresh, and a stored status value allows us to compare the new and old versions, and only notify if anything has changed.

{% include image.html src="/assets/images/vNextBuilds/Screenshots/Notifications.PNG" alt="Notifications" centered="true" imgsize="medium" %}

### Viewing build errors

We can use a click data-bind attribute to call a function that loads errors into a Bootstrap modal. This allows us to immediately understand why the build is failing, which doesn't *seem* useful on its own. But when you have 50+ builds broken, many of which may be the result of improperly configured build definitions, having this modal saves a tremendous amount of time in figuring out which builds need your attention first.

{% include image.html src="/assets/images/vNextBuilds/Screenshots/Error_Modal.PNG" alt="Error modal" centered="true" imgsize="fluid" %}

### TFS Helper

If desired, you could go as far as to set up a full TFS Helper web project using ASP.NET and incorporate this as one of the pages. The advantage here is that you could use service hooks on completed builds to maintain a database of the "breaking" changeset, rather than just using the changeset of the latest build, which may be completely irrelevant to what's broken. You would then need to implement a simple API to call instead of the built-in TFS APIs, but that shouldn't take more than about an hour.

<hr />

And that's about all I have to say about that. This just goes to show that extending the functionality of TFS doesn't necessarily require building extensions, or setting up complicated development environments with hundreds of packages and dependencies. You can create a reasonable facsimile in an afternoon using just a couple of simple frameworks and your text editor of choice.

Again, for more info, be sure to check out the [mockup](/vNextBuilds), and the full [javascript](https://gist.github.com/Kujawadl/ee7e0d1a21b1e993eb967677ca23f143) and [html](https://gist.github.com/Kujawadl/4094714b43c0c60230b67848f5789a26) source.
