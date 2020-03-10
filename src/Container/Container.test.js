import { Container } from './Container';

test('Container initialization', () => {
    const container = new Container({ state: null });

    expect(container.state).toBeNull();
})
