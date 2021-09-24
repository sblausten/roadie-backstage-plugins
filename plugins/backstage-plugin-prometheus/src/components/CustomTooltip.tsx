/*
 * Copyright 2021 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { Typography } from '@material-ui/core';

export const CustomTooltip = ({
  active,
  payload,
  unit,
  label,
  coordinate,
  tickCollector,
  metrics,
}) => {
  if (payload === null) return null;

  if (active) {
    const { min, max } = tickCollector.maxAndMin();
    const threshold = min.value / 30;
    const deltaY = max.y - min.y;
    const deltaValue = max.value - min.value;
    const cursorValue =
      min.value - deltaValue * ((min.y - coordinate.y) / deltaY);
    const points = payload.map(p => {
      const { color, stroke, dataKey, fill, name, payload } = p;
      return {
        color,
        stroke,
        dataKey,
        fill,
        name: name,
        value: payload[dataKey],
      };
    });
    const nearestPointIndexes = points.reduce(
      (
        acc: { index: number; delta: number }[],
        curr: { value: number },
        index: number,
      ) => {
        const delta = Math.abs(curr.value - cursorValue);
        if (acc.length === 0)
          return delta < threshold ? [{ index, delta }] : [];
        if (Math.abs(delta - acc[0].delta) < threshold)
          return acc.concat([{ index, delta }]);
        return acc;
      },
      [],
    );

    if (nearestPointIndexes.length === 0) return null;
    const nearestPoints = nearestPointIndexes.map(({ index }) => points[index]);
    return (
      <div>
        {nearestPoints.map((nearestPoint, index) => {
          const metricForItem = metrics[nearestPoint.name];
          return (
            <>
              <div key={`nearestPoint_${index}`}>
                <p>{`${nearestPoint.name}: ${label}`}</p>
              </div>
              {Object.entries(metricForItem).map(([key, val]) => (
                <Typography
                  key={key}
                  variant="caption"
                  display="block"
                  gutterBottom
                >
                  {`${key}: ${val}`}
                </Typography>
              ))}
            </>
          );
        })}
      </div>
    );
  }
  return null;
};

export function tooltipCollector() {
  const collection: { value: number; y: number }[] = [];
  let _min = { y: 0, value: 0 };
  let _max = { y: 1, value: 1 };
  function _setMaxAndMin(coll: { value: number; y: number }[]) {
    const ys = coll.map(obj => obj.y);
    const maxY = Math.max(...ys);
    const maxYIndex = ys.indexOf(maxY);
    _max = coll[maxYIndex];
    const minY = Math.min(...ys);
    const minYIndex = ys.indexOf(minY);
    _min = coll[minYIndex];
  }
  return {
    collect: (value: number, y: number) => {
      collection.push({ value, y });
      _setMaxAndMin(collection);
    },
    maxAndMin: () => {
      return {
        max: { ..._max },
        min: { ..._min },
      };
    },
  };
}
