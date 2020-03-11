import { publish, subscribe } from '@ictoanen/pub-sub';

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
    this.eventScope = { scope: uniqueId("container") };

    publish(this.events.ready, null, this.eventScope);
  }

  events = {
    // The updated event is fired once all middleware is done,
    // and the values inside the DataWrapper have updated correctly.
    update: "UPDATE",
    // The update event is fired once a value has updated.
    beforeUpdate: "BEFORE_UPDATE"
  };

  /* ======================================================================== */

  subscribeToEvent(event, callback) {
    subscribe(
      event,
      ({ detail }) => callback({
        ...detail,
        currentState: this.state
      }),
      this.eventScope
    );
  }

  onUpdate(callback) {
    this.subscribeToEvent(this.events.update, callback);
  }

  onBeforeUpdate(callback) {
    this.subscribeToEvent(this.events.beforeUpdate, callback);
  }

  /* ======================================================================== */

  update = async(updatedState, options = {}) => {
    publish(this.events.beforeUpdate, { updatedState }, this.eventScope);

    this.state = await this.transformState(
      updatedState,
      {
        ...this.state,
        ...updatedState
      },
      options
    );

    publish(this.events.update, { updatedState }, this.eventScope);

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
