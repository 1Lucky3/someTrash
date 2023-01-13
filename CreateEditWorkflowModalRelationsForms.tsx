import {DeleteOutlined, PlusCircleOutlined} from '@ant-design/icons';
import {RelationElementOption} from '@hipaatizer/api-docs';
import {
    Divider,
    Form,
    Select,
} from 'antd';
import get from 'lodash/get';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import EnhancedButton from '__components/EnhancedButton';

import {RELATIONS_FORM_FORM_ITEM_NAME, STEPS_FORM_ITEM_NAME} from '../../consts';
import {formComponentsOptionsDataSelector} from '../../selectors/formComponentsOptionsSelectors';
import {formRelationsService} from '../../services/formRelationsService';
import {RelationFormsType} from '../../types';
import {Props} from './types';
import {makeComponentsOptions} from './utils/makeComponentsOptions';
import {makeListNamePath} from './utils/makeListNamePath';
import {makeStepsFormOptions} from './utils/makeStepsFormOptions';

import {b} from './CreateEditWorkflowModalRelationsForms.less';

const CreateEditWorkflowModalRelationsForms = ({form}: Props) => {
    const componentsOptions = useSelector(formComponentsOptionsDataSelector);

    const [{loading, index}, setLoadingData] = useState({loading: false, index: 0});

    const {t} = useTranslation(['pages', 'other']);

    const onSelectForm = (order: number, name: keyof RelationFormsType) => async (value: string) => {
        const fieldValues = [
            {
                name: makeListNamePath(order, name),
                value: undefined,
            },
            name === 'fromComponent' && {
                name: makeListNamePath(order, 'fromComponentType'),
                value: undefined,
            },
        ];

        form.setFields(fieldValues.filter(Boolean));

        const isOptionsExisted = componentsOptions.some(({workflowId}) => value === workflowId);

        if (!isOptionsExisted) {
            try {
                setLoadingData({loading: true, index: order});

                await formRelationsService.handleRequest(value);
            } finally {
                setLoadingData({loading: false, index: order});
            }
        }
    };

    const onChangeComponentSelect = (order: number) => (_, option: RelationElementOption | RelationElementOption[]) => {
        const {elementType} = option as RelationElementOption;

        form.setFields([
            {
                name: makeListNamePath(order, 'toComponent'),
                value: undefined,
            },
            {
                name: makeListNamePath(order, 'fromComponentType'),
                value: elementType,
            },
        ]);
    };

    return (
        <Form.List
            name={RELATIONS_FORM_FORM_ITEM_NAME}
        >
            {
                (fields, {add, remove}) => (
                    <div className={b()}>
                        {fields.map(({key}, i) => (
                            <div key={key}>
                                <div className={b('header')}>
                                    <Form.Item
                                        noStyle
                                        shouldUpdate={(prev, next) => prev[STEPS_FORM_ITEM_NAME] !== next[STEPS_FORM_ITEM_NAME]}
                                    >
                                        {
                                            ({getFieldValue}) => (
                                                <Form.Item
                                                    name={[i, 'fromForm']}
                                                    rules={[{required: true, message: t('pages:WORKFLOWS_PAGE.CREATE_EDIT_WORKFLOW_MODAL_RELATIONS_FORM_SELECT_ERROR_MESSAGE')}]}
                                                    className={b('form')}
                                                >
                                                    <Select
                                                        options={makeStepsFormOptions(getFieldValue(STEPS_FORM_ITEM_NAME))}
                                                        placeholder={t('pages:WORKFLOWS_PAGE.CREATE_EDIT_WORKFLOW_MODAL_RELATIONS_FORM_SELECT_PLACEHOLDER')}
                                                        allowClear
                                                        onChange={onSelectForm(i, 'fromComponent')}
                                                        disabled={loading && index === i}
                                                    />
                                                </Form.Item>
                                            )
                                        }
                                    </Form.Item>

                                    <Form.Item
                                        noStyle
                                        shouldUpdate={(prev, next) => prev[STEPS_FORM_ITEM_NAME] !== next[STEPS_FORM_ITEM_NAME]}
                                    >
                                        {
                                            ({getFieldValue}) => (
                                                <Form.Item
                                                    name={[i, 'toForm']}
                                                    rules={[{required: true, message: t('pages:WORKFLOWS_PAGE.CREATE_EDIT_WORKFLOW_MODAL_RELATIONS_FORM_SELECT_ERROR_MESSAGE')}]}
                                                    className={b('form')}
                                                >
                                                    <Select
                                                        options={makeStepsFormOptions(getFieldValue(STEPS_FORM_ITEM_NAME))}
                                                        placeholder={t('pages:WORKFLOWS_PAGE.CREATE_EDIT_WORKFLOW_MODAL_RELATIONS_FORM_SELECT_PLACEHOLDER')}
                                                        allowClear
                                                        onChange={onSelectForm(i, 'toComponent')}
                                                        disabled={loading && index === i}
                                                    />
                                                </Form.Item>
                                            )
                                        }
                                    </Form.Item>

                                    <EnhancedButton
                                        buttonProps={{
                                            icon: <DeleteOutlined/>,
                                            danger: true,
                                            disabled: i === 0,
                                        }}
                                        popconfirmProps={{
                                            title: t('other:ARE_YOU_SURE'),
                                            onConfirm: () => remove(i),
                                        }}
                                    />
                                </div>

                                <div className={b('body')}>
                                    <Form.Item
                                        noStyle
                                        shouldUpdate={(prev, next) => {
                                            const path = makeListNamePath(i, 'fromForm');

                                            return get(prev, path) !== get(next, path);
                                        }}
                                    >
                                        {
                                            ({getFieldValue}) => {
                                                const id = getFieldValue(makeListNamePath(i, 'fromForm'));

                                                return (
                                                    <>
                                                        <Form.Item
                                                            name={[i, 'fromComponentType']}
                                                            noStyle
                                                            // Сохраняем в этой форме тип выбранного элемента
                                                        >
                                                            <div hidden/>
                                                        </Form.Item>

                                                        <Form.Item
                                                            name={[i, 'fromComponent']}
                                                            rules={[{required: true, message: t('pages:WORKFLOWS_PAGE.CREATE_EDIT_WORKFLOW_MODAL_RELATIONS_COMPONENT_SELECT_ERROR_MESSAGE')}]}
                                                            className={b('form')}
                                                        >
                                                            <Select
                                                                options={makeComponentsOptions(componentsOptions, id)}
                                                                placeholder={t('pages:WORKFLOWS_PAGE.CREATE_EDIT_WORKFLOW_MODAL_RELATIONS_COMPONENT_SELECT_PLACEHOLDER')}
                                                                disabled={loading && index === i}
                                                                onChange={onChangeComponentSelect(i)}
                                                            />
                                                        </Form.Item>
                                                    </>
                                                );
                                            }
                                        }
                                    </Form.Item>

                                    <Form.Item
                                        noStyle
                                        shouldUpdate={(prev, next) => {
                                            const formSelectPath = makeListNamePath(i, 'toForm');
                                            const componentSelectPath = makeListNamePath(i, 'fromComponent');

                                            return get(prev, formSelectPath) !== get(next, formSelectPath) ||
                                                get(prev, componentSelectPath) !== get(next, componentSelectPath);
                                        }}
                                    >
                                        {
                                            ({getFieldValue}) => {
                                                const id = getFieldValue(makeListNamePath(i, 'toForm'));
                                                const elementType = getFieldValue(makeListNamePath(i, 'fromComponentType'));

                                                return (
                                                    <Form.Item
                                                        name={[i, 'toComponent']}
                                                        rules={[{required: true, message: t('pages:WORKFLOWS_PAGE.CREATE_EDIT_WORKFLOW_MODAL_RELATIONS_COMPONENT_SELECT_ERROR_MESSAGE')}]}
                                                        className={b('form')}
                                                    >
                                                        <Select
                                                            options={makeComponentsOptions(componentsOptions, id, elementType)}
                                                            placeholder={t('pages:WORKFLOWS_PAGE.CREATE_EDIT_WORKFLOW_MODAL_RELATIONS_COMPONENT_SELECT_PLACEHOLDER')}
                                                            disabled={loading && index === i}
                                                        />
                                                    </Form.Item>
                                                );
                                            }
                                        }
                                    </Form.Item>
                                </div>

                                <Divider className={b('divider')}/>
                            </div>
                        ))}

                        <EnhancedButton
                            buttonProps={{
                                icon: <PlusCircleOutlined/>,
                                onClick: () => add(),
                                className: b('addButton'),
                            }}
                        >
                            {t('pages:WORKFLOWS_PAGE.CREATE_EDIT_WORKFLOW_MODAL_RELATIONS_ADD_ROW_BUTTON')}
                        </EnhancedButton>
                    </div>
                )
            }
        </Form.List>
    );
};

export default CreateEditWorkflowModalRelationsForms;
