export interface IHistoryOptions<T = any> {
    /**
     * Optional rules array for optimizing data transforming.
     * By defining rules you can specify how to transform between states and internal "chunks".
     */
    rules?: IRuleOptions<T>[];

    /**
     * Optional initial state.
     */
    initialState?: T;

    /**
     * Debounce time for push in milliseconds, 50 by default.
     */
    delay?: number;

    /**
     * Max length saving history states, 100 by default.
     */
    maxLength?: number;

    /**
     * Whether serializing state data into chunks. true by default.
     */
    useChunks?: boolean;

    /**
     * Fired when pushing / pulling states with changed state passed in.
     */
    onChange?: (state: T) => void;
}

export interface IRuleOptions<T = any> {
    /**
     * Defines whether a rule can be matched.
     * @param state the state that you pushed.
     */
    match: (state: T) => boolean;

    /**
     * Split state into shareable chunks.
     */
    toRecord: (
      state: T,
    ) => {
        chunks: any[];
        children?: any[];
    };

    /**
     * Parse the chunks back into the state node
     * @param shareableChunks
     */
    fromRecord: (shareableChunks: { chunks: any[]; children: any[] }) => T;
}

export class History<T = any> {
    /**
     * Valid record length of current instance
     */
    readonly length: number;

    /**
     * Whether current state has undo records before.
     */
    readonly hasUndo: boolean;

    /**
     * Whether current state has redo records after.
     */
    readonly hasRedo: boolean;

    /**
     * Main class for state management
     */
    constructor(options?: IHistoryOptions<T>);

    /**
     * Push state data into history, using pushSync under the hood.
     * @param state state data to push.
     * @param pickIndex if specified, only this index of state's child will be serialized.
     */
    push(state: T, pickIndex?: number): Promise<History>;

    /**
     * Push state data into history.
     * @param state state data to push.
     * @param pickIndex if specified, only this index of state's child will be serialized.
     */
    pushSync(state: T, pickIndex?: number): History;

    /**
     * Undo a record if possible, supports chaining.
     */
    undo(): History;

    /**
     * Redo a record if possible, supports chaining.
     */
    redo(): History;

    /**
     * Pull out a history state from records.
     */
    get(): T;

    /**
     * Clear internal data structure.
     */
    reset(): History;
}
