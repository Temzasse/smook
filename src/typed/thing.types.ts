import { Model } from './smook';
import thingModel from './thing.model';

export interface Thing {
  foo: string;
  bar: number;
}

export interface ThingState {
  items: Thing[];
  foo: number;
  bar: string;
}

export type ThingModel = Model<typeof thingModel, ThingState>;