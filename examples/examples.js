import { Container, ContainerManager } from '../';

class Destinations extends Container {
  constructor(state = getOption('state')) {
    super({ state });
  }
}

class Finetuner extends Container {
  constructor(state = getOption('finetuner-state')) {
    super({ state });
  }
}

const filterContextManager = new ContainerManager({
  destinations: Destinations,
  finetuner: Finetuner
}, () => getOption('filter-context'));

filterContextManager.getContainer(() => getOption('filter-context'));

/* ========================================================================== */

function transformA() {
  return { hi: 'hello' }
}

async function transformB() {
  const x = await new Promise(resolve => setTimeout(() => resolve('hello??'), 1000));

  return { test: x };
}

async function transformC({ currentState, options }) {
  if(currentState.test !== 'bla' && !options.leaveIt) {
    const x = await new Promise(resolve => setTimeout(() => resolve('bla'), 1000));

    return { test: x };
  }

  return {};
}

const c = new Container({}, [transformA, transformB, transformC]);

c.onUpdate((x) => console.log(x, 'has changed :)'));
c.onUpdate(() => console.log(c.state, 'from subscription'));
