const fruitsReducer = (state = [], action) => {
    switch (action.type) {
        case "ADD_FRUIT":
            return [...state, action.payload];
        default:
            return state;
    }
};

const countReducer = (state = 0, action) => {
    switch (action.type) {
        case "INCREMENT":
            return state + 1;
        case "DECREMENT":
            return state - 1;
        default:
            return state;
    }
};

const increment = () => {
    return {
        type: "INCREMENT"
    };
};


const decrement = () => {
    return {
        type: "DECREMENT"
    };
};


const add = (fruit) => {
    return {
        type: "ADD_FRUIT",
        payload: fruit
    };
};

const createStore = () => {
    let state = {
        fruits: [],
        count: 0
    };

    let listeners = [];

    return {
        getState: () => {
            return state;
        },
        dispatch: (action) => {
            state = {
                fruits: fruitsReducer(
                    state.fruits,
                    action
                ),
                count: countReducer(
                    state.count,
                    action
                )
            };
            listeners.forEach(listener => listener());
        },
        subscribe: (listener) => {
            listeners.push(listener);
        }
    };
};

const store = createStore();

store.subscribe(() => {
    console.log(store.getState());
});

store.dispatch(increment());
store.dispatch(increment());
store.dispatch(increment());
store.dispatch(decrement());
store.dispatch(add("Uva"));
store.dispatch(add("Pera"));