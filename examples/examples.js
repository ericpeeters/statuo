
class Destinations extends Container {
  constructor(state = getOption('state')) {
    super(state, [tra, trb, trc]);
  }
}

class Finetuner extends Container {
  constructor(state = getOption('finetuner-state')) {
    super(state, [tra, trb, trc]);
  }
}

const filterContextManager = new ContainerManager({
  destinations: Destinations,
  finetuner: Finetuner
}, getOption('filter-context'));

filterContextManager.get(() => getOption('filter-context'));

/* ========================================================================== */

export const Destinations = new Container(getOption('state'), [tra, trb, trc]);

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

c.subscribe((x) => console.log(x, 'has changed :)'));
c.subscribe(() => console.log(c.state, 'from subscription'));
