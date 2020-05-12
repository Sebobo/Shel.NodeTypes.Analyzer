# Neos CMS Content Repository analysis & visualizer

[![Latest Stable Version](https://poser.pugx.org/shel/contentrepository-debugger/v/stable)](https://packagist.org/packages/shel/contentrepository-debugger)
[![Total Downloads](https://poser.pugx.org/shel/contentrepository-debugger/downloads)](https://packagist.org/packages/shel/contentrepository-debugger)
[![License](https://poser.pugx.org/shel/contentrepository-debugger/license)](https://packagist.org/packages/shel/contentrepository-debugger)

This package allows to output the nodetypes of your Neos CMS project
as various types of graphs via a backend module.

It helps understanding dependencies between packages and nodetypes.
Also it shows which nodetypes are actually being used and can make your
refactoring our code structuring efforts easier.

## Installation

It is recommended to install this package only as development
dependency and not to run it in production except specifically required.

    composer require --dev shel/contentrepository-debugger
    
## Usage

### Backend module

You will have an additional backend module `NodeType Analyzer` available in the Neos backend:

![Neos NodeType Analyzer Backendmodule](Documentation/Images/NodeTypeAnalyzer.png "NodeType Analyzer")

You can inspect all nodetypes registered in the system and
drill down through your namespaces.

A second graph layout allows your to inspect all direct and indirect dependencies.

![Dependency inspection](Documentation/Images/NodeTypeDependencies.png "Dependency inspection")
 
## Contributing

Contributions are very welcome.

Most of the code is written in TypeScript using React & D3js and can be found in `Resources/Private/JavaScript`.
To make a change first create your own fork, install the package in your Neos project 
and start a new branch. 
Then run `yarn watch` to rebuild the frontend code during development.

A pre commit hook is automatically triggered that will lint the code to make sure
it fulfills our coding guidelines.

Then create a PR from your fork and some tests will automatically check the code quality 
via Github actions.

## Using the package in your projects

When you use the package for commercial projects, please consider funding its development
via the Github sponsor button. Or get in touch with [me](mailto:funding@helzle.it) for other ways of support. 
