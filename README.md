# Neos CMS Content Repository visualizer / debugger

This package allows to output the nodetypes of your Neos CMS project
as various types of graphs. You can get a visual graph in the backend 
of Neos.

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
 
