# 🎄 Advent Of Code in Brainfuck

<img alt="Braingoat" height="40px" src="./lib/meta/logo.svg" />

A while ago I started a project called [braingoat](https://github.com/wolflu05/braingoat) which is a programming language that is made to be transpiled into valid brainfuck code.
This sub-folder contains solutions for puzzles written in brainfuck with the help of braingoat. Because there is currently no strings implemented, I decided to allow myself some simple preprocessing. Thats why each solution has a `.bf` file and a `.b` file. The `.bf` file contains a javascript function `getInput` which just parses the input and returns a string that then gets sent to the brainfuck program. But if you don't trust me, just use your own input, split it like shown in the example in the `.bf` file, goto a brainfuck executor (e.g. this [IDE](https://kvbc.github.io/bf-ide/)), paste the input and copy the `.b` file.

> [!IMPORTANT]  
> Please not, that braingoat is in an alpha phase and there is currently no support for integers bigger than 255. Thats why only some specific puzzles and inputs will work. But there is definitely the plan to implement that in the future
