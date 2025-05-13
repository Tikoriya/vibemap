import { Spot } from "../Spot";

export type CityStackParamList = {
  index: undefined;
  create: {
    spots: Spot[];
      addSpot: (spot: Spot) => void;
      onSubmit: () => void;
  }
};