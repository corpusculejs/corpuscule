# @corpuscule/utils/lib/scheduler

This module provides a solution for scheduling tree-structured tasks where
one task could spawn a number of new tasks to complete.

The default purpose of this module is to provide a scheduling system for the
web components that could schedule rendering of nested components recursively.

## Usage

This module provides tools to work with restrictions of the Custom Elements
spec.

## Usage

Install the package via one of the following command:

```bash
$ npm install @corpuscule/utils
```

or

```bash
$ yarn add @corpuscule/utils
```

Then import it:

```typescript
import schedule from '@corpuscule/utils/lib/scheduler';
```

## API

### schedule

```typescript
function schedule(task: () => void): Promise<void>;
```

Schedules tree-structured tasks where one task could generate a number of
children which execution is also scheduled. Each task is connected to a parent
one, and also can have a child and a sibling. Traversing algorithm is
depth-first. There are two visits to the node: the first one occurs when the
task is going to be performed, and the second one is when we need to resolve or
reject the scheduled promise.

If task execution runs into an error, it rejects all promises from bottom to
top.

##### Parameters

- **task**: Function - a function to schedule.

  ```typescript
  () => void;
  ```

##### Returns

**Type**: _Promise<void>_

A Promise which resolves when the task is completed or rejects if there is any
error.
