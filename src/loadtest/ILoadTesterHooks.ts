/**
 * Defines the progress callbacks that the LoadTester class will use
 * to inform consumers on the execution of load tests.
 */
import {ILoadTestResult} from "./ILoadTestResult";
import {ILoadTestConfig} from "./ILoadTestConfig";

export interface ILoadTesterHooks {
  /**
   * Indicates that a new set of tests has stared.
   * @param testCount
   *   The number of tests to run.
   */
  testingStarted?: (configs: ILoadTestConfig[]) => void;


  /**
   * Indicates that a test run has started.
   * @param module
   *   The name of the module being tested.
   */
  testStarted?: (module: string, schema: string) => void;


  objectCompleted?: (num: number) => void;

  /**
   * Indicates that a test run has finished.
   *
   * @param module
   *   The name of the module that was tested.
   */
  testFinished?: (result: ILoadTestResult) => void;


  testingFinished?: (results: ILoadTestResult[]) => void;
}