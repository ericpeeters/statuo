import { Container } from "../Container/Container";
import { ContainerManager } from "./ContainerManager";

describe("ContainerManager tests", () => {
    class X extends Container {}
    class Y extends Container {}

	test("Instantiation", () => {
		const defaultContainerManager = new ContainerManager();

		expect(defaultContainerManager.containerMapping).toEqual({});
	});

	test("Simple container management", () => {
		const manager = new ContainerManager({
            x: X,
            y: Y
        });

        expect(manager.getContainer('x')).toBeInstanceOf(X);
        expect(manager.getContainer('y')).toBeInstanceOf(Y);
    });

    test("Container injection", () => {
		const manager = new ContainerManager({
            x: X,
            y: Y
        }, () => 'y');

        expect(manager.getContainer()).toBeInstanceOf(Y);
    });

    test("Incompatible getKey function", () => {
        const manager = new ContainerManager({
            x: X,
            y: Y
        });

        expect(() => manager.getContainer(1)).toThrow();
    })
});
