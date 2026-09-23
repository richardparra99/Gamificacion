const { createSlice, configureStore } = require("@reduxjs/toolkit");


const frutsSlices = createSlice({
    initialState: [],
    name: "fruts",

    reducers: {
        add: (state, action) => [...state, action.payload]
    }
});


const countSlices = createSlice({
    initialState: 0,
    name: "count",
    reducers: {
        increment: (state) => state + 1,
        decrement: (state) => state - 1
    }
});

const store = configureStore({
    reducer: {
        fruts: frutsSlices.reducer,
        count: countSlices.reducer
    }
});

store.subscribe(() => console.log(store.getState()));

const { increment, decrement } = countSlices.actions;
const { add } = frutsSlices.actions;

store.dispatch(increment());
store.dispatch(increment());
store.dispatch(increment());
store.dispatch(decrement());

store.dispatch(add("Uva"));
store.dispatch(add("Pera"));