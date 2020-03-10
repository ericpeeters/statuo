**statuo** - Container based state management

This library borrows some ideas from the Flux architecture pattern. Read more about Flux here: https://facebook.github.io/flux/.

What this library aims to solve is the complexity that comes from actions being mandatory. Without actions it is not possible to modify the state of the application.

The separation of UI and state becomes a lot more natural when application components can request to modify the state directly and allow other components to react to these changes. Components are written in a manner that makes them responsible for a piece of state, just like they probably listen to a piece of the state changing.

This library mixes a state containers with a simple pub-sub API that allows your application to separate the entire application state from very specific pieces of your application.

## API

### Container

Simple usage example:

Create a counter state container and increment/decrement the state.

```javascript
import { Container } from 'statuo';

class CounterContainer extends Container {
  constructor(initialState = { count: 1 }) {
    super(initialState);
  }
}
```

```javascript
import { CounterContainer } from 'x';

const container = new CounterContainer();

container.onUpdate(({ updatedState }) => console.log(updatedState));

const increment = (container) => container.update({ count: container.state.count + 1 });
const decrement = (container) => container.update({ count: container.state.count - 1 });

increment(container); // Logs { count: 2 } from the `onUpdate` handler
decrement(container); // Logs { count: 1 } from the `onUpdate` handler
```

### Container methods

Class instantiation.

```javascript
new Container({
  // The initial state of the container.
  state: {},
  // Transform the state when an update occurs.
  transforms: []
})
```

When the full chain is completed and a container is done updating its state.

`Container.onUpdate(({ updatedState, currentState }) => void);`

Before the container starts running its update chain but is signaled to change its state.

`Container.onBeforeUpdate(({ updatedState, currentState }) => void);`

When a container is filled with its initial state and ready to be used.

`Container.onReady(({ currentState }) => void);`

Update a container's state.

`Container.update({ count: 1 }, { options });`

---

### Transforms

Sometimes we want certain state to always behave in a certain way. For example, having a range date picker, when we change the `startDate` we always want to flush the `endDate`.

For cases like these, specific pieces of state reacting to each other we can use transforms. Transforms work like reducer functions except they don't have to react to the entire state. We can just return a specific piece of state and the container will do the rest.

We define which transforms apply to what container. The signature looks like this:

```javascript
async function transformSomething({ currentState, options }) {
   // React to current container state and options provided to the .update() call
   return { countMinusOne: currentState.count - 1 };
}
```

This transform will *always* add a property to the container state called `countMinusOne`. The transforms are basically async functions that always run when a container state gets updated.

When you call `.update()` on a container, it allows you to pass additional options, these options will always find their way to all transforms of the container. This allows you to skip transformations when specific changes occur. You can invent any options you need to determine which transforms should or should not run, or apply logic to a transform.

An example of this:

```javascript
export const container = new Container({ startDate: null, endDate: null }, [transformRangeDates]);
```

```javascript
export async function transformRangeDates({ updatedState, options }) {
  // When the startDate property has been updated
  // and range date selection is active
  if(updatedState.startDate && options.range) {
    return { endDate: null };
  }
}
```

```javascript
datepicker.onDateSelected((selectedDate) => container.update({ startDate: selectedDate }, { range: true }));

container.onUpdate(({ currentState }) => {
  if(currentState.endDate === null) {
    // Flush end date from the UI
    // (you might not need to be this explicit when using a virtual dom library or some form of templating)
  }
});
```

### ContainerManager

Since we now use containers to define our state we need a way to tell our components which container to pay attention to.

We can create an instance and connect our components to that reference and it will work. But most of the time we want to be more dynamic. Create multiple containers or different types of containers in different situations. So, `ContainerManager` to the rescue!

ContainerManager serves as a bridge between components and the right container at the right time. Sounds cryptic doesn't it? Lets look at some examples.

```javascript
// x
const manager = new ContainerManager({
  filters: FilterContainer,
  todos: TodoContainer
}, () => document.body.getAttribute('data-container'));
```

```javascript
import manager from 'x';

// Retrieve the currently 'active' container
const currentContainer = manager.getContainer();
```

Here we see an example of 2 containers being registered to a ContainerManager. The trick is in the second parameter, this parameter is either a string with the key of the container or a function that defines how to retrieve the key. The key can also be provided by calling `.getContainer(key)`. In the example above, if our HTML has `<body data-container="filters" />`, it will create an instance of the FilterContainer and pass it to all components that ask the manager for a reference.

This allows us to 'inject' the right container to our components or features when they need it and makes sure they all look at the same instance.


