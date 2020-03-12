# <img src='./logo-trans.png' height='60' alt='Statuo logo' />

Container based state management

This library borrows some ideas from the Flux architecture pattern. Read more about Flux here: https://facebook.github.io/flux/.

What this library aims to solve is the complexity that comes from actions being mandatory. Without actions it is not possible to modify the state of the application.

The separation of UI and state becomes a lot more natural when application components can request to modify the state directly and allow other components to react to these changes. Components are written in a manner that makes them responsible for a piece of state, just like they probably listen to a piece of the state changing.

This library mixes a state containers with a simple pub-sub API that allows your application to separate the entire application state from very specific pieces of your application.

## API

### Container

Simple usage example:

Create a counter state container and increment/decrement the state.

```javascript
// x
import { Container } from 'statuo';

export class CounterContainer extends Container {
  constructor(initialState = { count: 1 }) {
    super({ state: initialState });
  }
}
```

```javascript
import { CounterContainer } from 'x';

const container = new CounterContainer();

container.onUpdate(({ updatedState }) => console.log(updatedState));

const increment = container => container.update({ count: container.state.count + 1 });
const decrement = container => container.update({ count: container.state.count - 1 });

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

Update a container's state.
```javascript
Container.update({ count: 1 }, { options });
```


Delete a property from the container's state.
```javascript
Container.delete('count', { options });
```


When the full chain is completed and a container is done updating its state.
```javascript
Container.onUpdate(({ updatedState, currentState }) => void);
```


Before the container starts running its update chain but is signaled to change its state.
```javascript
Container.onBeforeUpdate(({ updatedState, currentState }) => void);
```

---

### Transforms

Sometimes we want certain state to always behave in a certain way. We can use transforms to manage pieces of state. The transforms are basically async functions that always run when a container state gets updated. Transforms work like reducer functions except they don't have to keep the entire state into account. We can just return a specific piece of state and the container will merge it.

When you call `.update()` on a container instance, it will always run all transforms immediately after updating the state.

It also allows you to pass additional options, these options will always find their way to all transforms of the container. This allows you to customize transform behavior based on options. You can invent _any_ option you need to determine which transforms should or should not run, or apply logic to a transform.

An example of a transform:

```javascript
async function transformSomething({ currentState }) {
  return { countMinusOne: currentState.count - 1 };
}
```

This transform will *always* add a property to the container state called `countMinusOne`.

Another example of this:

```javascript
// x
export async function transformResetOnMax({ updatedState, options }) {
  if(!options.max || !updatedState.count) {
    return;
  }

  if(updatedState.count > options.max) {
    return { count: 0 };
  }
}
```

```javascript
// y
import { transformResetOnMax } from 'x';

export const container = new Container({
  state: { count: 0 },
  transforms: [transformResetOnMax]
});
```

```javascript
import { container } from 'y';

const incrementUntilThree = container => container.update(
  { count: container.state.count + 1 },
  { max: 3 }
);

incrementUntilThree(); // state = { count: 1 }
incrementUntilThree(); // state = { count: 2 }
incrementUntilThree(); // state = { count: 3 }
// Our transform makes sure the state is reset
incrementUntilThree(); // state = { count: 0 }
```

---

### ContainerManager

Since we now use containers to define our state we need a way to tell our components which container to pay attention to.

We can create an instance and connect our components to that reference and it will work. But most of the time we want to be more dynamic. Create multiple containers or different types of containers in different situations. We can use a `ContainerManager` for this.

ContainerManager serves as a bridge between components and the right container at the right time.

For example:

```javascript
// x
export const manager = new ContainerManager({
  filters: FilterContainer,
  todos: TodoContainer
}, () => document.body.getAttribute('data-container'));
```

```javascript
import { manager } from 'x';

// Retrieve the currently 'active' container
const currentContainer = manager.getContainer();
```

Here we see an example of 2 containers being registered to a ContainerManager. The trick is in the second parameter, this parameter is either a string with the key of the container or a function that defines how to retrieve the key. The key can also be provided by calling `.getContainer(key)`. In the example above, if our HTML has `<body data-container="filters" />`, it will create an instance of the FilterContainer and pass it to all components that ask the manager for a reference.

This allows us to 'inject' the right container to our components or features when they need it and makes sure they all look at the same instance.
