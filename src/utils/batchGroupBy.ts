import { groupByActionTypes, StateWithHistory } from 'redux-undo';
import cuid from 'cuid';
import { Action } from 'redux';

export const batchGroupBy: { _group: string | null } & any = {
  _group: null,
  start(group = cuid()) {
    this._group = group
  },
  end() {
    this._group = null
  },
  init<State>(rawActions: Action | Action[]) {
    const defaultGroupBy = groupByActionTypes(rawActions)
    return (
      action: Action,
      currentState: State,
      previousHistory: StateWithHistory<State>
    ) => this._group || defaultGroupBy(action, currentState, previousHistory);
  }
}