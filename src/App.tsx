import React, { useRef, useState } from "react";
import type { ActionType, ProColumns } from "@ant-design/pro-table";
import { EditableProTable } from "@ant-design/pro-table";
import ProCard from "@ant-design/pro-card";
import { Button } from "antd";
import ProForm, { ProFormField, ProFormInstance } from "@ant-design/pro-form";

type DataSourceType = {
  id: React.Key;
  miniCost?: number;
  flat?: number;
  currency?: string;
  children?: DataSourceType[];
  rowSpan?: number;
  index?: number;
};

const createNewArr = (data: any) => {
  return data
    .reduce((result: any, item: any) => {
      //首先将name字段作为新数组result取出
      if (result.indexOf(item.currency) < 0) {
        result.push(item.currency);
      }
      return result;
    }, [])
    .reduce((result: any, currency: any) => {
      //将name相同的数据作为新数组取出，并在其内部添加新字段**rowSpan**
      const children = data.filter((item: any) => item.currency === currency);
      result = result.concat(
        children.map((item: any, index: number) => ({
          ...item,
          rowSpan: index === 0 ? children.length : 0 //将第一行数据添加rowSpan字段
        }))
      );
      return result;
    }, []);
};

const defaultData: DataSourceType[] = [];
const loopDataSourceFilter = (
  data: DataSourceType[],
  id: React.Key | undefined,
): DataSourceType[] => {
  return data
    .map((item) => {
      if (item.id !== id) {
        if (item.children) {
          const newChildren = loopDataSourceFilter(item.children, id);
          return {
            ...item,
            children: newChildren.length > 0 ? newChildren : undefined,
          };
        }
        return item;
      }
      return null;
    })
    .filter(Boolean) as DataSourceType[];
};

export const App = () => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() =>
    defaultData.map((item) => item.id)
  );
  const [dataSource, setDataSource] = useState<DataSourceType[]>(
    () => defaultData
  );
  const formRef = useRef<ProFormInstance<any>>();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<DataSourceType>[] = [
    {
      title: "Currency",
      dataIndex: "currency",
      width: "30%",
      valueType: "select",
      valueEnum: {
        USD: { text: "USD", status: "USD" },
        RUB: {
          text: "RUB",
          status: "RUB"
        }
      },
      formItemProps: {
        rules: [
          {
            required: true,
            whitespace: true,
            message: "此项是必填项"
          }
        ]
      }, 
      render: (value, row, index) => {
        // console.log(value, row);
        const obj = {
          children: value,
          props: {
            rowSpan: row.rowSpan as any,
          },
        };

        return obj;
      },
    },
    {
      title: "Mini Cost",
      dataIndex: "miniCost",
      valueType: "text",
      width: "20%",
      render: (value, row, index) => {
        // console.log(value, row);
        const obj = {
          children: value,
          props: {
            rowSpan: row.rowSpan as any,
          },
        };

        return obj;
      },
    },
    {
      title: "Flat",
      dataIndex: "flat",
      valueType: "text",
      width: "20%"
    },
    {
      title: "Action",
      valueType: "option",
      width: 250,
      render: (text, record, _, action) => {
        console.log(actionRef, 'action')
        return [
          <a
            key="delete"
            onClick={() => {
              setDataSource(loopDataSourceFilter(dataSource, record.id));
            }}
          >
            删除
          </a>,
          <a
          key="edit"
          onClick={() => {
            action?.startEditable?.(record.id);
            setDataSource([...dataSource])
          }}
        >
          编辑
        </a>,
          <a
          key="add"
          onClick={() => {
           action?.addEditRecord({
             currency: record.currency,
             miniCost: record.miniCost,
             id: Date.now(),
           })
          }}
        >
          添加
        </a>
        ]
      },
    }
  ];

  return (
    <ProForm<{
      table: DataSourceType[];
    }>
      formRef={formRef}
      initialValues={{
        table: defaultData,
      }}
    >
      <EditableProTable<DataSourceType>
        headerTitle="可编辑表格"
        columns={columns}
        bordered
        rowKey="id"
        actionRef={actionRef}
        value={createNewArr(dataSource)}
        onChange={setDataSource}
        recordCreatorProps={{
          newRecordType: "dataSource",
          record: () => ({
            id: Date.now()
          })
        }}
        toolBarRender={() => {
          return [
            <Button
              type="primary"
              key="save"
              onClick={() => {
                // dataSource 就是当前数据，可以调用 api 将其保存
                console.log(dataSource);
              }}
            >
              保存数据
            </Button>
          ];
        }}
        editable={{
          type: "multiple",
          editableKeys,
          // actionRender: (row, config, defaultDoms) => {
          //   console.log(row, config, defaultDoms)
          //   return [defaultDoms.delete];
          // },
          onValuesChange: (record, recordList) => {
            setDataSource(recordList);
          },
          onChange: setEditableRowKeys
        }}
      />
      <ProCard title="表格数据" headerBordered collapsible defaultCollapsed>
        <ProFormField
          ignoreFormItem
          fieldProps={{
            style: {
              width: "100%"
            }
          }}
          mode="read"
          valueType="jsonCode"
          text={JSON.stringify(dataSource)}
        />
      </ProCard>
    </ProForm>
  );
};
