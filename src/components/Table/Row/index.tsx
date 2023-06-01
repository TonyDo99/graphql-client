"use client";

import useDragDrop from "@/hooks/useDragDrop";
import { filterDuplicate, isEmpty } from "@/ultis/helpers";
import { isArray } from "@apollo/client/utilities";
import React, { useCallback, useMemo, useRef, useState } from "react";

type Props = {
  rows: [];
  columns?: [];
  draggable?: boolean;
  classList?: any;
  cols?: any;
  dragOver?: any;
  handleDragRows: (newRows: any) => {} | void;
  handleChecked: ({ item, currentSelectedID, type, checked }: any) => {} | void;
  selectable: boolean;
  setChkbox: any;
  chkbox: any;
  checkBoxDataRef: any;
  hiddenSpanRef: any;
  className?: string;
  onRowClick: (record: any) => {} | void;
};

const Row = ({
  rows,
  draggable,
  classList,
  cols,
  dragOver,
  handleDragRows = () => {},
  selectable,
  handleChecked,
  setChkbox,
  chkbox,
  checkBoxDataRef,
  hiddenSpanRef,
  className,
  onRowClick = () => {},
}: Props) => {
  const { dragDropContainerRef, dragDropAttribute, closestId } =
    useDragDrop({
      hoverStyle: classList.over,
      behavior: "INSERTBEFORE",
      chkbox: chkbox,
      hiddenSpanRef: hiddenSpanRef,
      callBack: (oldIndex: any, newIndex: any, isDragMultiple: boolean) => {
        const newRows = [...rows];
        if (isArray(oldIndex) && oldIndex.length > 1 && isDragMultiple) {
          oldIndex.forEach((ele: any) => {
            const data = newRows?.find((e: any) => e.key === ele) as never;
            const getEleIndex = newRows?.findIndex((e: any) => e.key === ele);
            newRows?.splice(getEleIndex, 1);
            newRows?.splice(newIndex, 0, data);
          });
          return handleDragRows(newRows);
        }

        const item = newRows?.[oldIndex];
        newRows?.splice(oldIndex, 1);
        newRows?.splice(newIndex, 0, item);
        handleDragRows(newRows);
      },
    }) ?? {};

  const handleRenderTD = useCallback(
    (columnData: any) =>
      cols?.map((item: any, index: any) => {
        const isHaveRender =
          !isEmpty(item?.render) || typeof item?.render === "function";
        const { dataIndex } = item ?? {};
        const _columnData = columnData?.[dataIndex] ?? [];

        return isHaveRender ? (
          <td key={index}>{item?.render(_columnData, columnData)}</td>
        ) : (
          <td key={index} drag-over={(cols[index] === dragOver).toString()}>
            {_columnData}
          </td>
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cols]
  );

  const processingSelectData = async (item: any, e: any) => {
    const isChecked = e.target.checked;
    const checkboxData = checkBoxDataRef.current ?? [];
    if (isChecked) {
      checkBoxDataRef.current = filterDuplicate([...checkboxData, item] as any);
      setChkbox((prevState: any) => [...prevState, item.key]);
      return handleChecked({
        type: "normal",
        item: checkBoxDataRef.current,
        currentSelectedID: item.key,
        checked: isChecked,
      });
    }
    const tmpRef = checkBoxDataRef.current;
    await tmpRef.forEach((e: any, index: any) => {
      if (e.key === item.key) return tmpRef.splice(index, 1);
    });
    checkBoxDataRef.current = tmpRef.flat();
    await chkbox.forEach((e: any, index: any) => {
      if (e === item.key) return chkbox.splice(index, 1);
    });
    setChkbox(chkbox.flat());
    return handleChecked({
      type: "normal",
      item: checkBoxDataRef.current,
      currentSelectedID: item.key,
      checked: isChecked,
    });
  };

  const handleRenderColumns = useMemo(() => {
    if (isEmpty(rows)) return;
    return rows?.map((item: any, index: any) => {
      const isChecked = chkbox?.includes(item?.key);
      return (
        <tr
          key={index}
          className={`${className}`}
          id={closestId} // @@@ need this for drag @@@
          {...dragDropAttribute} // @@@ need this for drag @@@
          onClick={() => onRowClick(item)}
        >
          {draggable && (
            <td
              draggable={draggable} // @@@ need this for drag @@@
              key={index + 999}
              className="text-center cursor-move"
            >
              |||
            </td>
          )}
          {selectable && (
            <td key={index + 1000}>
              <input
                type="checkbox"
                onChange={(e: any) => processingSelectData(item, e)}
                checked={isChecked}
              />
            </td>
          )}
          {handleRenderTD(item)}
        </tr>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, cols, chkbox]);

  return (
    <tbody
      ref={dragDropContainerRef} // @@@ need this for drag @@@
    >
      {handleRenderColumns}
    </tbody>
  );
};

export default Row;
