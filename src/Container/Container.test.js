import { Container } from './Container';

describe('Container tests', () => {
    test('Instantiation', () => {
        const container = new Container({ state: null });

        expect(container.state).toBeNull();
        expect(container).toBeInstanceOf(Container);
    });

    test('Updating state', async () => {
        const container = new Container({ state: { count: 1 }});

        expect(container.state).not.toBeNull();
        expect(container.state.count).toEqual(1);

        await container.update({ count: 3 });

        expect(container.state.count).toEqual(3);
    });

    test('Update event', async () => {
        const container = new Container({ state: { count: 1 }});
        const mockFn = jest.fn();

        container.onUpdate(mockFn);

        await container.update({ count: 1 });

        expect(mockFn).toHaveBeenLastCalledWith({
            updatedState: { count: 1 },
            currentState: { count: 1 }
        });

        await container.update({ maxCount: 1 });

        expect(mockFn).toHaveBeenLastCalledWith({
            updatedState: { maxCount: 1 },
            currentState: {
                count: 1,
                maxCount: 1
            }
        });

        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    test('Before update event', async () => {
        const container = new Container({ state: { count: 0 }});
        const mockFn = jest.fn();

        container.onBeforeUpdate(mockFn);

        await container.update({ count: 1 });

        expect(mockFn).toHaveBeenLastCalledWith({
            updatedState: { count: 1 },
            currentState: { count: 0 }
        });

        await container.update({ maxCount: 1 });

        expect(mockFn).toHaveBeenLastCalledWith({
            updatedState: { maxCount: 1 },
            currentState: { count: 1 }
        });

        expect(mockFn).toHaveBeenCalledTimes(2);
    });
});

