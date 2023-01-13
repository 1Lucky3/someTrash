import {
    Checkbox,
    Divider,
    Form,
    Input,
    Modal,
    Skeleton,
    Typography,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import get from 'lodash/get';
import React, {MouseEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import EnhancedButton from '__components/EnhancedButton';
import ModalFormFooter from '__components/ModalFormFooter';
import makeDeepModel from '__utils/infrastructure/makeDeepModel';
import makeModel from '__utils/infrastructure/makeModel';

import {bound as actions} from '../../actions';
import TimeRangeTable from '../../components/time-range-table';
import {createEditScheduleModalDataSelector} from '../../selectors/createEditScheduleModalSelectors';
import {scheduleDataIsSuccessSelector, scheduleDataSelector} from '../../selectors/schedulesDataSelectors';
import {schedulesDataService} from '../../services/schedulesDataService';
import {DAYS_OF_WEEKS, WEEKLY_HOURS_SHORT_NAME_VALUES} from './consts';
import {CreateEditScheduleModel} from './types';
import {makeWeeklyHoursIsAvailableInitialValues} from './utils/makeWeeklyHoursIsAvailableInitialValues';

import {b} from './CreateEditScheduleModal.less';

const CreateEditScheduleModal = () => {
    const {t} = useTranslation(['other', 'pages']);

    const [form] = Form.useForm<CreateEditScheduleModel>();

    const {scheduleId} = useSelector(createEditScheduleModalDataSelector);
    const {weeklyHours, ...dataRest} = useSelector(scheduleDataSelector);
    const isSuccess = useSelector(scheduleDataIsSuccessSelector);

    const initialValues: CreateEditScheduleModel = {
        ...dataRest,
        ...makeWeeklyHoursIsAvailableInitialValues(weeklyHours),
    };

    const onSubmit = async (e: MouseEvent) => {
        e.preventDefault();

        const data = await form.validateFields();

        scheduleId
            ? await schedulesDataService.handleUpdate(data)
            : await schedulesDataService.handleCreate(data);
    };

    return (
        <Modal
            title={scheduleId ? t('pages:APPOINTMENTS_SETTINGS_PAGE.EDIT_SCHEDULE') : t('pages:APPOINTMENTS_SETTINGS_PAGE.CREATE_SCHEDULE')}
            open
            centered
            footer={false}
            onCancel={() => actions.createEditScheduleModal.reset()}
        >
            <Skeleton active loading={scheduleId && !isSuccess}>
                <Form
                    layout="vertical"
                    form={form}
                    initialValues={initialValues}
                >
                    <Form.Item
                        name={makeModel<CreateEditScheduleModel>(m => m.title)}
                        label={t('other:TITLE_INPUT_LABEL')}
                        rules={[{required: true, message: t('other:TITLE_INPUT_ERROR_MESSAGE')}]}
                    >
                        <Input placeholder={t('other:TITLE_INPUT_PLACEHOLDER')}/>
                    </Form.Item>

                    <Form.Item
                        name={makeModel<CreateEditScheduleModel>(m => m.notes)}
                        label={t('pages:APPOINTMENTS_SETTINGS_PAGE.CREATE_EDIT_SCHEDULE_MODAL_NOTES_INPUT_LABEL')}
                    >
                        <TextArea
                            placeholder={t('pages:APPOINTMENTS_SETTINGS_PAGE.CREATE_EDIT_SCHEDULE_MODAL_NOTES_INPUT_PLACEHOLDER')}
                            rows={4}
                        />
                    </Form.Item>

                    <Typography.Text strong className={b('title')}>
                        {t('pages:APPOINTMENTS_SETTINGS_PAGE.CREATE_EDIT_SCHEDULE_MODAL_WEEKLY_HOURS')}
                    </Typography.Text>

                    {DAYS_OF_WEEKS.map(day => {
                        const weeklyHoursDayPath = makeDeepModel<CreateEditScheduleModel>(m => m.weeklyHours[day]);
                        const isDayAvailablePath = makeDeepModel<CreateEditScheduleModel>(m => m.isDayAvailable[day]);

                        return (
                            <React.Fragment key={day}>
                                <div className={b('dayRow')}>
                                    <Form.Item
                                        name={isDayAvailablePath}
                                        valuePropName="checked"
                                        noStyle
                                    >
                                        <Checkbox>{WEEKLY_HOURS_SHORT_NAME_VALUES[day]}</Checkbox>
                                    </Form.Item>

                                    <Form.Item
                                        noStyle
                                        shouldUpdate={(prev, next) => get(prev, isDayAvailablePath) !== get(next, isDayAvailablePath)}
                                    >
                                        {
                                            ({getFieldValue}) => !getFieldValue(isDayAvailablePath) && (
                                                <Typography.Text type="secondary">
                                                    {t('pages:APPOINTMENTS_SETTINGS_PAGE.UNAVAILABLE_TEXT')}
                                                </Typography.Text>
                                            )
                                        }
                                    </Form.Item>
                                </div>

                                <Form.Item
                                    noStyle
                                    shouldUpdate={(prev, next) =>
                                        get(prev, isDayAvailablePath) !== get(next, isDayAvailablePath) ||
                                        get(prev, weeklyHoursDayPath).length !== get(next, weeklyHoursDayPath).length
                                    }
                                >
                                    {
                                        ({getFieldValue}) => getFieldValue(isDayAvailablePath) && (
                                            <TimeRangeTable
                                                dataSource={getFieldValue(weeklyHoursDayPath)}
                                                form={form}
                                                dayFormPath={weeklyHoursDayPath}
                                            />
                                        )
                                    }
                                </Form.Item>

                                <Divider/>
                            </React.Fragment>
                        );
                    })}

                    <ModalFormFooter
                        cancelButton={
                            <EnhancedButton
                                buttonProps={{
                                    onClick: () => actions.createEditScheduleModal.reset(),
                                }}
                            >
                                {t('other:CANCEL')}
                            </EnhancedButton>
                        }
                        submitButton={
                            <EnhancedButton
                                buttonProps={{
                                    type: 'primary',
                                    htmlType: 'submit',
                                    onClick: onSubmit,
                                }}
                            >
                                {scheduleId ? t('other:UPDATE') : t('other:CREATE')}
                            </EnhancedButton>
                        }
                    />
                </Form>
            </Skeleton>
        </Modal>
    );
};

export default CreateEditScheduleModal;
