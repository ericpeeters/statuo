/*
 |------------------------------------------------------------------------------
 | Statuo - ContainerManager
 |------------------------------------------------------------------------------
 |
 | This piece of code solves problems with resolving the correct container at
 | the right time.
 |
 | Since there can be different types of containers and it can be hard to
 | determine what container should be used at what time.
 |
 | The manager ensures that we have our containers managed in one place,
 | and allows for a bridge between our components and our container instances.
 |
 */

import memoize from 'fast-memoize';

/* ========================================================================== */

export class ContainerManager {
	constructor(containerMapping = {}, getKey) {
		this.containerMapping = containerMapping;
		this.getKey = getKey;
	}

	getInstance = memoize(key => new this.containerMapping[key]());

	getContainer(getKey = this.getKey) {
		if (typeof getKey !== "string" && typeof getKey !== "function") {
			throw new TypeError(
				`getContainer did not get a valid 'getKey' specified. Expected string or function, received ${typeof getKey}.`
			);
		}

		return this.getInstance(typeof getKey === "string" ? getKey : getKey());
	}
}
