

### 1. What is the difference between var, let, and const?

"var" is the old way of declaring variables in JavaScript. The problem with var is that it is function scoped, meaning it can be accessed outside of blocks like if statements or loops. It also gets hoisted to the top which can cause bugs.

"let" is the modern way to declare variables that can change. It is block scoped so it stays inside the curly braces where it was defined. I used let in my project for things like currentTab and allIssues because their values change over time.

"const" is used when the value will never be reassigned. It is also block scoped like let. I used const for API_BASE because the URL never changes. The difference is that const does not mean the value is frozen completely, for example you can still push items into a const array.

### 2. What is the spread operator (...)?

The spread operator is three dots written before an array or object. It basically unpacks or spreads out all the elements. For example if I have two arrays and want to combine them I can write [...array1, ...array2] instead of using concat. I also used a similar idea when filtering issues, where I spread results to create a new array without changing the original. It is very useful when you want to copy an array or merge objects without modifying the originals.

### 3. What is the difference between map(), filter(), and forEach()?

All three loop through arrays but they work differently.
"map()" goes through every item and returns a new array with transformed values. In my project I used map to convert label names into HTML badge strings.


"filter()" goes through every item and returns a new array with only the items that pass a condition. I used filter in my project to show only open or closed issues depending on which tab is active.

"forEach()" just loops through every item and does something but does not return anything. It is used when you just want to perform an action like adding cards to the DOM. I used forEach to loop through issues and append each card to the grid.

### 4. What is an arrow function?

An arrow function is a shorter way to write functions in JavaScript. Instead of writing function keyword you use an arrow like =>. For example:

Normal function:
function greet(name) {
  return "Hello " + name;
}

Arrow function:
const greet = (name) => "Hello " + name;




### 5. What are template literals?

Template literals are a way to write strings in JavaScript using backtick characters instead of normal quotes. The best thing about them is you can put variables directly inside the string using ${} syntax without having to use plus signs to join strings together.

For example instead of writing:

"Hello " + name + " you have " + count + " issues"

With template literals I can write:

`Hello ${name} you have ${count} issues`

