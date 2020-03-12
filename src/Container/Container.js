import { publish, subscribe } from "@ictoanen/pub-sub";

/* ========================================================================== */

function getUniqueContainerId() {
	if (!getUniqueContainerId.num) {
		getUniqueContainerId.num = 0;
	}

	getUniqueContainerId.num += 1;

	return `container-${getUniqueContainerId.num.toString()}`;
}

/* ========================================================================== */

export class Container {
	constructor({ state = {}, transforms = [] } = {}) {
		this.state = state;
		this.transforms = transforms;
		this.eventScope = { scope: getUniqueContainerId() };

		publish(this.events.ready, null, this.eventScope);
	}

	/* ======================================================================== */

	/**
	 * There are currently only two events, one before the update chain is run,
	 * and one once its done updated and we have our new state.
	 */
	events = {
		update: "UPDATE",
		beforeUpdate: "BEFORE_UPDATE"
	};

	/* ======================================================================== */

	subscribeToEvent(event, callback) {
		subscribe(
			event,
			({ detail }) =>
				callback({
					...detail,
					currentState: this.state
				}),
			this.eventScope
		);
	}

	/* ======================================================================== */

	onUpdate(callback) {
		this.subscribeToEvent(this.events.update, callback);
	}

	onBeforeUpdate(callback) {
		this.subscribeToEvent(this.events.beforeUpdate, callback);
	}

	/* ======================================================================== */

	transformState = async (updatedState, state, options) => {
		return this.transforms.reduce(async (currentState, transform) => {
			try {
				return {
					...(await currentState),
					...(await transform({
						currentState: await currentState,
						updatedState,
						options
					}))
				};
			} catch (err) {
				throw new Error(err);
			}
		}, state);
	};

	/* ======================================================================== */

	update = async (updatedState, options = {}) => {
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
	};

	delete = async (property, options = {}) => {
		if (!(property in this.state)) {
			throw new ReferenceError(
				`Cannot delete property ${property} from state. State is currently: ${JSON.stringify(
					this.state
				)}`
			);
		}

		publish(this.events.beforeUpdate, {}, this.eventScope);

		delete this.state[property];

		this.state = await this.transformState({}, this.state, options);

		publish(this.events.update, {}, this.eventScope);

		return this.state;
	};
}
