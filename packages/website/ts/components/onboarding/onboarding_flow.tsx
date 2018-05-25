import * as _ from 'lodash';
import * as React from 'react';
import Joyride, { CallbackData, Step, StyleOptions } from 'react-joyride';

import { OnboardingTooltip } from 'ts/components/onboarding/onboarding_tooltip';
import { zIndex } from 'ts/utils/style';

export interface OnboardingFlowProps {
    steps: Step[];
    blacklistedStepIndices: number[];
    stepIndex: number;
    isRunning: boolean;
    onClose: () => void;
    setOnboardingStep: (stepIndex: number) => void;
}

const joyrideStyleOptions: StyleOptions = {
    zIndex: zIndex.overlay,
};

// Wrapper around Joyride with defaults and styles set
export class OnboardingFlow extends React.Component<OnboardingFlowProps> {
    public componentDidMount(): void {
        this._setOnboardingStepBasedOnBlacklist(this.props.stepIndex);
    }

    public componentWillReceiveProps(nextProps: OnboardingFlowProps): void {
        this._setOnboardingStepBasedOnBlacklist(nextProps.stepIndex);
    }

    public render(): React.ReactNode {
        return (
            <Joyride
                run={this.props.isRunning}
                continuous={true}
                debug={true}
                steps={this.props.steps}
                stepIndex={this.props.stepIndex}
                styles={{ options: joyrideStyleOptions }}
                tooltipComponent={this._renderToolTip.bind(this)}
            />
        );
    }

    private _setOnboardingStepBasedOnBlacklist(nextIndex: number): void {
        const blacklistedSteps = this.props.blacklistedStepIndices;
        const newStepIndex = this._adjustedStepBasedOnBlacklist(
            this.props.stepIndex,
            nextIndex,
            this.props.steps.length,
            blacklistedSteps,
        );
        if (newStepIndex !== nextIndex) {
            this.props.setOnboardingStep(newStepIndex);
        }
    }

    private _adjustedStepBasedOnBlacklist(
        currentStep: number,
        nextStep: number,
        totalSteps: number,
        blacklistedSteps: number[],
    ): number {
        if (!blacklistedSteps.includes(nextStep)) {
            return nextStep;
        }
        let newStep = nextStep;
        const op = nextStep >= currentStep ? _.add : _.subtract;
        let didSearch = false;
        while (blacklistedSteps.includes(newStep)) {
            newStep = op(newStep, 1);
            if (newStep < 0) {
                if (didSearch) {
                    break;
                }
                newStep = totalSteps - 1;
                didSearch = true;
            }
            if (newStep >= totalSteps) {
                if (didSearch) {
                    break;
                }
                newStep = 0;
                didSearch = true;
            }
        }
        return newStep;
    }

    private _renderToolTip(): React.ReactNode {
        const { steps, stepIndex } = this.props;
        const step = steps[stepIndex];
        const isLastStep = steps.length - 1 === stepIndex;
        return (
            <OnboardingTooltip
                title={step.title}
                content={step.content}
                isLastStep={isLastStep}
                onClose={this.props.onClose}
                onClickNext={this._goToNextStep.bind(this)}
                onClickBack={this._goToPrevStep.bind(this)}
            />
        );
    }

    private _goToNextStep(): void {
        const nextStep = this.props.stepIndex + 1;
        if (nextStep < this.props.steps.length) {
            this.props.setOnboardingStep(nextStep);
        } else {
            this.props.onClose();
        }
    }

    private _goToPrevStep(): void {
        const nextStep = this.props.stepIndex - 1;
        if (nextStep >= 0) {
            this.props.setOnboardingStep(nextStep);
        } else {
            this.props.onClose();
        }
    }
}