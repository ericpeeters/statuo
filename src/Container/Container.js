

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

export class Container {
  constructor({
    state = {},
    transforms = []
  }) {
    this.state = state;
    this.transforms = transforms;

    this.id = uniqueId("container");

    this.publish(this.events.ready);
  }

  events = {
    // The updated event is fired once all middleware is done,
    // and the values inside the DataWrapper have updated correctly.
    update: "UPDATE",
    // The update event is fired once a value has updated.
    beforeUpdate: "BEFORE_UPDATE",
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
      throw new ReferenceError(`
        Event not found in predefined events,
        given: ${event}, expected ${this.events.keys()}
      `);
    }

    subscribe(this.getUniqueEvent(event), ({ detail }) => callback({
      currentState: this.state,
      updatedState: detail.updatedState
    }));
  }

  /* ========================================================================== */

  onReady(callback) {
    this.subscribe(this.events.ready, callback);
  }

  onUpdate(callback) {
    this.subscribe(this.events.update, callback);
  }

  onBeforeUpdate(callback) {
    this.subscribe(this.events.beforeUpdate, callback);
  }

  /* ======================================================================== */

  update = async(updatedState, options = {}) => {
    this.publish(this.events.beforeUpdate, { updatedState });

    this.state = await this.transformState(
      updatedState,
      {
        ...this.state,
        ...updatedState
      },
      options
    );

    this.publish(this.events.update, { updatedState });

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
