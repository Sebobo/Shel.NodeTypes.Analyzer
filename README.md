# Neos CMS Content Repository visualizer / debugger

This package allows to output the nodetypes of your Neos CMS project
as various types of graphs. You can get a visual graph in the backend 
of Neos or as image file via CLI. Also you can get the graph as GraphML 
or GraphViz file via CLI.

## Installation

It is recommended to install this package only as development
dependency and not to run it in production except specifically required.

    composer require --dev shel/contentrepository-debugger
    
Additionally you will have to install the graphviz library on your 
system to make everything work.

On a Mac with homebrew this would work like this:

    brew install graphviz
    
Feel free to create a PR for this readme to add installation instructions 
for other platforms.
    
## Usage

### Backend module

You will have an additional backend module `NodeType Analyzer` available in the Neos backend:

![Neos NodeType Analyzer Backendmodule](Documentation/Images/NodeTypeAnalyzer.png "NodeType Analyzer")

It allows you to browser through your nodetypes and render them with different layouts.
Each layout has its own advantages and disadvantages.

### CLI

TODO
