interface IHistoryOptions {
    /**
     * Optional rules array for optimizing data transforming.
     * By defining rules you can specify how to transform between states and internal "chunks".
     */
    rules?: IRuleOptions[];

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
    onChange?: (state: any) => void;
}

interface IRuleOptions {
    /**
     * Defines whether a rule can be matched.
     * @param state the state that you pushed.
     */
    match: (state: any) => boolean;

    /**
     * Split state into shareable chunks.
     */
    toRecord: (state: any) => {
        chunks: any[];
        children?: any[];
    };

    /**
     * Parse the chunks back into the state node
     * @param shareableChunks
     */
    fromRecord: (shareableChunks: {
        chunks: any[],
        children: any[]
    }) => any;
}

export class History {
    /**
     * Valid record length of current instance
     */
    length: number;

    /**
     * Whether current state has undo records before.
     */
    hasUndo: boolean;

    /**
     * Whether current state has redo records after.
     */
    hasRedo: boolean;

    /**
     * Main class for state management
     */
    constructor(options?: IHistoryOptions);

    /**
     * Push state data into history, using pushSync under the hood.
     * @param state state data to push.
     * @param pickIndex if specified, only this index of state's child will be serialized.
     */
    push(state: any, pickIndex?: number): Promise<History>;

    /**
     * Push state data into history.
     * @param state state data to push.
     * @param pickIndex if specified, only this index of state's child will be serialized.
     */
    pushSync(state: any, pickIndex?: number): History;

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
    get(): any;

    /**
     * Clear internal data structure.
     */
    reset(): History;
}
