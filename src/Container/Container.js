

/* ========================================================================== */

const createEventHub = () => ({
  hub: Object.create(null),
  emit(event, data) {
    (this.hub[event] || []).forEach(handler => handler(data));
  },
  on(event, handler) {
    if (!this.hub[event]) this.hub[event] = [];
    this.hub[event].push(handler);
  },
  off(event, handler) {
    const i = (this.hub[event] || []).findIndex(h => h === handler);
    if (i > -1) this.hub[event].splice(i, 1);
    if (this.hub[event].length === 0) delete this.hub[event];
  }
});

const hub = createEventHub();

function publish(event, data) {
  hub.emit(event, data);
}

function subscribe(event, handler) {
  hub.on(event, handler);
}

/* ========================================================================== */

function uniqueId(prefix = "") {
  if(!uniqueId.num) {
    uniqueId.num = 0;
  }

  uniqueId.num += 1;

  return prefix + uniqueId.num. toString();
}

/* ========================================================================== */

class Container {
  constructor(
    state = {},
    transforms = []
  ) {
    this.state = state;
    this.transforms = transforms;

    this.id = uniqueId("container");

    this.publish(this.events.ready);
  }

  events = {
    // The updated event is fired once all middleware is done,
    // and the values inside the DataWrapper have updated correctly.
    change: "CHANGE",
    // The change event is fired once a value has changed.
    beforeChange: "BEFORE_CHANGE",
    // When the container is ready to be used.
    ready: "READY"
  };

  /* ======================================================================== */

  getUniqueEvent(event) {
    return `${event}_${this.id}`;
  }

  publish(event, payload) {
    publish(this.getUniqueEvent(event), payload);
  }

  subscribe(event, callback) {
    if(!event in this.events) {
      throw new ReferenceError(`Event not found in predefined events, given: ${event}, expected ${this.events.keys()}`);
    }

    subscribe(this.getUniqueEvent(event), callback);
  }

  /* ========================================================================== */

  onReady(callback) {
    this.subscribe(this.events.ready, callback);
  }

  onChange(callback) {
    this.subscribe(this.events.change, callback);
  }

  onBeforeChange(callback) {
    this.subscribe(this.events.beforeChange, callback);
  }

  /* ======================================================================== */

  update = async(newState, options = {}) => {
    this.publish(this.events.beforeChange, { changedState: newState });

    this.state = await this.transformState(
      newState,
      {
        ...this.state,
        ...newState
      },
      options
    );

    this.publish(this.events.change, {
      changedState: newState,
      state: this.state
    });

    return this.state;
  }

  transformState(updatedState, state, options) {
    return new Promise((resolve, reject) => {
        try {
          const transformedState = this.transforms.reduce(
            async (currentState, transform) => ({
                ...await currentState,
                ...await transform({
                  currentState,
                  updatedState,
                  options
                })
            }),
            state
          );

          resolve(transformedState);
        } catch(err) {
          reject(err);
        }
    });
  }
}
