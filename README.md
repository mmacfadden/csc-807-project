# MacFadden CSC-807 Class Project
This repository hosts Michael MacFadden's Project source code for [Dakota State University's](https://dsu.edu) CSC-807 "Cyber Security Research". This README gives a brief overview of the project and the code implementation.

# Architecture

## Limitations

# Development
This project was developed in [Typescript](https://www.typescriptlang.org/) and cross-compiled into JavaScript for use in the browser.

## Dependencies
The following tools were used to develop this project.

  - [Node](https://nodejs.org/en/): 16.x (LTS)
  - [yarn](https://yarnpkg.com/): 1.22.x

## Building
To build the project issue the following command:

```shell
npm run build
```

The build will produce a UMD module in the [dist](dist) directory.

## Testing
The project has an extensive array of unit tests using the [Mocha](https://mochajs.org/) testing framework, augmented with the [ChaiJS Assertion Library](https://www.chaijs.com/). The project uses the [Istanbul](https://istanbul.js.org/) code coverage framework to evaluate the coverage of the unit tests.

To run the test issue the following command:
```shell
npm run test
```


# TODOs
The project has several TODOs.
- Test composite keys
- Test indices
- Test cursor iteration
- Find a common cryptographically strong random byte / string generator.

Additional algorithms to look at:
- https://en.wikipedia.org/wiki/International_Data_Encryption_Algorithm
- https://en.wikipedia.org/wiki/ARIA_(cipher)
- https://en.wikipedia.org/wiki/CAST-256