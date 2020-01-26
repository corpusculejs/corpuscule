import {createContextToken} from '@corpuscule/context';
import {
  Constructor,
  CustomElement,
  CustomElementClassProperties,
  DecoratedClassProperties,
} from '@corpuscule/typings';
import createTokenRegistry from '@corpuscule/utils/lib/tokenRegistry';
import {
  Config as FormConfig,
  configOptions,
  FieldState,
  FieldSubscription,
  FieldValidator,
  FormApi,
  FormState,
  Unsubscribe,
} from 'final-form';

export type FormFieldConstructor<C> = Constructor<
  C,
  CustomElement,
  CustomElementClassProperties & DecoratedClassProperties<C>
>;

export type FormFieldPrototype<C> = {
  constructor: FormFieldConstructor<C>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};

export const gearResponsibilityKeys = [
  // Form & Field
  'formApi',

  // Form
  'state',

  // Field
  'input',
  'meta',
  'refs',
] as const;

export const optionResponsibilityKeys = [
  // Form
  ...configOptions,
  'compareInitialValues',

  // Field
  'format',
  'formatOnBlur',
  'isEqual',
  'name',
  'parse',
  'subscription',
  // eslint-disable-next-line capitalized-comments
  // validate // validate already exist in configOptions
  'validateFields',
  'value',
];

export type GearResponsibilityKey = typeof gearResponsibilityKeys[number];
export type OptionResponsibilityKey = typeof optionResponsibilityKeys[number];

export type FormGears<V = object> = {
  formApi: FormApi<V>;
  state: FormState<V>;
};

export type FormOptions<V = object> = FormConfig<V> & {
  compareInitialValues?: (
    prevInitialValues: object,
    nextInitialValues: object,
  ) => boolean;
};

export type FieldInputProps<V> = {
  name: string;
  value: V;
};

export type FieldMetaProps<V> = Omit<
  FieldState<V>,
  'name' | 'value' | 'blur' | 'change' | 'focus' | 'length'
>;

export type FieldGears<V> = {
  formApi: FormApi;
  input: FieldInputProps<V>;
  meta: FieldMetaProps<V>;
  refs: NodeListOf<HTMLInputElement>;
};

export type FieldOptions<V> = {
  format?: (value: V, name: string) => any;
  formatOnBlur?: boolean;
  isEqual?: (a: any, b: any) => boolean;
  name?: string;
  parse?: (value: any, name: string) => V;
  subscription?: FieldSubscription;
  validate?: FieldValidator<V>;
  validateFields?: string[];
  value?: V;
};

export type WeakMapReplace<T> = {
  [P in keyof T]-?: WeakMap<object, T[P]>;
};

export type WeakMapPropertyKeyReplace<T> = {
  [P in keyof T]-?: WeakMap<object, PropertyKey>;
};

export type SharedFormProps = Omit<WeakMapReplace<FormGears>, 'formApi'> &
  WeakMapPropertyKeyReplace<FormOptions>;

export type SharedFieldProps = Omit<
  WeakMapReplace<FieldGears<unknown>>,
  'formApi'
> &
  WeakMapPropertyKeyReplace<FieldOptions<unknown>>;

export type SharedProps = SharedFormProps & SharedFieldProps;

export type SharedGearProps = Omit<
  WeakMapReplace<FieldGears<unknown> & FormGears>,
  'formApi'
>;

export type SharedOptionProps = WeakMapPropertyKeyReplace<
  FieldOptions<unknown> & FormOptions
>;

export const [createFormToken, tokenRegistry] = createTokenRegistry<
  SharedProps
>(
  () =>
    [...gearResponsibilityKeys, ...optionResponsibilityKeys].reduce<
      SharedProps
    >((acc, key) => {
      if (key !== 'formApi') {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
        acc[key] = new WeakMap<object, any>();
      }

      return acc;
    }, {} as SharedProps),
  createContextToken,
);

export type NativeFormElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export const isNativeFormElement = (
  instance: HTMLElement,
): instance is NativeFormElement =>
  instance instanceof HTMLInputElement ||
  instance instanceof HTMLSelectElement ||
  instance instanceof HTMLTextAreaElement;

export const convertTargetValueToFormValue = (
  target: NativeFormElement,
  formValue: unknown | unknown[],
): unknown | unknown[] => {
  const isFormValueArray = Array.isArray(formValue);

  switch (target.type) {
    case 'checkbox': {
      const {checked, defaultValue, value} = target as HTMLInputElement;

      // Form maintains an array, not just a boolean
      if (defaultValue) {
        // Add value to formValue array
        if (checked) {
          return isFormValueArray
            ? [...(formValue as unknown[]), value]
            : [value];
        }

        // Remove value from formValue array
        if (!isFormValueArray) {
          return formValue;
        }

        return (formValue as unknown[]).filter(v => v !== value);
      }

      // It's just a boolean
      return checked;
    }
    case 'select-one': {
      const {
        // TODO: Check with the latest versions
        // @ts-ignore
        selectedOptions: [{value}],
      } = target as HTMLSelectElement;

      return value;
    }
    case 'select-multiple': {
      const {selectedOptions} = target as HTMLSelectElement;

      return Array.from(selectedOptions, option => option.value);
    }
    default:
      // Element input[type=radio] is also here
      return target.value;
  }
};

const convertAndSetFormValueToTarget = (
  target: NativeFormElement,
  formValue: unknown | unknown[],
): void => {
  switch (target.type) {
    case 'checkbox':
      (target as HTMLInputElement).checked = Array.isArray(formValue)
        ? formValue.includes(target.value)
        : !!formValue;
      break;
    case 'radio':
      (target as HTMLInputElement).checked = formValue === target.value;
      break;
    case 'select-multiple':
      // TODO: Check with the latest versions
      // @ts-ignore
      for (const option of (target as HTMLSelectElement).options) {
        option.selected =
          Array.isArray(formValue) && formValue.includes(option.value);
      }
      break;
    default:
      target.value =
        isNativeFormElement(target) &&
        (formValue === null || formValue === undefined)
          ? ''
          : String(formValue);
  }
};

export const convertAndSetFormValuesToTarget = (
  targetOrTargets: NativeFormElement | NodeListOf<NativeFormElement>,
  formValue: unknown | unknown[],
): void => {
  if (targetOrTargets instanceof NodeList) {
    // TODO: Check with the 3.8 version
    // @ts-ignore
    for (const target of targetOrTargets) {
      convertAndSetFormValueToTarget(target, formValue);
    }
  } else {
    convertAndSetFormValueToTarget(targetOrTargets, formValue);
  }
};

// Field
export const $$connected = new WeakMap<object, boolean>();
export const $$isSubscriptionScheduled = new WeakMap<object, boolean>();
export const $$handleFocusOut = new WeakMap<object, () => void>();
export const $$handleInput = new WeakMap<
  object,
  (event: Event | CustomEvent<unknown>) => void
>();
export const $$handleFocusIn = new WeakMap<object, () => void>();
export const $$refGetter = new WeakMap<
  object,
  (this: any) => HTMLElement | NodeListOf<HTMLElement> | void
>();
export const $$scheduleSubscription = new WeakMap<
  object,
  (self: any) => void
>();
export const $$selfChange = new WeakMap<object, boolean>();
export const $$state = new WeakMap<object, FieldState<unknown>>();
export const $$subscribe = new WeakMap<object, (self: any) => void>();
export const $$unsubscribe = new WeakMap<object, Unsubscribe>();
export const $$update = new WeakMap<
  object,
  (state: FieldState<unknown>) => void
>();

// Form
export const $$reset = new WeakMap<object, (event: Event) => void>();
export const $$submit = new WeakMap<object, (event: Event) => void>();
export const $$unsubscriptions = new WeakMap<object, Unsubscribe[]>();
