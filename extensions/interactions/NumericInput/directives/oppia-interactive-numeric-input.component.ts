// Copyright 2021 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Directive for the NumericInput interaction.
 *
 * IMPORTANT NOTE: The naming convention for customization args that are passed
 * into the directive is: the name of the parameter, followed by 'With',
 * followed by the name of the arg.
 */

import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';
import isUndefined from 'lodash/isUndefined';
import { InteractionAttributesExtractorService } from 'interactions/interaction-attributes-extractor.service';
import { CurrentInteractionService } from 'pages/exploration-player-page/services/current-interaction.service';
import { NumericInputCustomizationArgs } from 'interactions/customization-args-defs';
import { NumericInputRulesService } from './numeric-input-rules.service';
import { NumericInputValidationService } from './numeric-input-validation.service';

interface NumericInputFormSchema {
  type: string;
  'ui_config': {};
}

@Component({
  selector: 'oppia-interactive-numeric-input',
  templateUrl: './numeric-input-interaction.component.html'
})
export class InteractiveNumericInput implements OnInit {
  @Input() requireNonnegativeInputWithValue: string = '';
  @Input() savedSolution;
  @Input() labelForFocusTarget;
  errorString = '';
  requireNonnegativeInput: boolean = false;
  answer = null;
  NUMERIC_INPUT_FORM_SCHEMA: NumericInputFormSchema;
  constructor(
    private currentInteractionService: CurrentInteractionService,
    private numericInputRulesService: NumericInputRulesService,
    private numericInputValidationService: NumericInputValidationService,
    private changeDetectorRef: ChangeDetectorRef,
    private interactionAttributesExtractorService:
      InteractionAttributesExtractorService
  ) { }

  private isAnswerValid(): boolean {
    return (
      this.answer !== undefined &&
      this.answer !== null &&
      this.answer !== '' &&
      isUndefined(
        this.numericInputValidationService.validateNumber(
          this.answer, this.requireNonnegativeInput)));
  }

  submitAnswer(answer: number): void {
    if (this.isAnswerValid()) {
      this.currentInteractionService.onSubmit(
        answer, this.numericInputRulesService);
    }
  }

  private getAttributesObject() {
    return {
      requireNonnegativeInputWithValue:
        this.requireNonnegativeInputWithValue
    };
  }

  onAnswerChange(answer: string | number): void {
    if (this.answer === answer) {
      return;
    }
    this.answer = answer;
    this.changeDetectorRef.detectChanges();
  }

  getSchema(): NumericInputFormSchema {
    return this.NUMERIC_INPUT_FORM_SCHEMA;
  }

  getLabelForFocusTarget(): string | null {
    return this.labelForFocusTarget;
  }

  ngOnInit(): void {
    const {
      requireNonnegativeInput
    } = this.interactionAttributesExtractorService.getValuesFromAttributes(
      'NumericInput',
      this.getAttributesObject()
    ) as NumericInputCustomizationArgs;
    this.requireNonnegativeInput = requireNonnegativeInput.value;
    this.answer = (
      this.savedSolution !== undefined ?
      this.savedSolution : ''
    );
    this.labelForFocusTarget = this.labelForFocusTarget || null;

    this.NUMERIC_INPUT_FORM_SCHEMA = {
      type: 'float',
      ui_config: {
        checkRequireNonnegativeInput: this.requireNonnegativeInput
      }
    };

    this.currentInteractionService.registerCurrentInteraction(
      () => this.submitAnswer(this.answer), () => this.isAnswerValid());
  }
}

angular.module('oppia').directive(
  'oppiaInteractiveNumericInput', downgradeComponent({
    component: InteractiveNumericInput
  }) as angular.IDirectiveFactory);
