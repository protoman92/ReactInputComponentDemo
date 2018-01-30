import { Subject, Subscription } from 'rxjs';
import * as React from 'react';
import { Component as BaseComponent } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { StateType } from 'type-safe-state-js';
import { MVVM } from 'react-base-utilities-js';
import { Properties, Provider as BaseProvider, Style } from './Dependency';
import * as Navigator from './Navigator';
import * as InputScreen from './Input';
import * as Screen from './Screen';

export namespace Provider {
  export interface Type extends BaseProvider.Type {}
}

export namespace ViewModel {
  export interface Type extends MVVM.ViewModel.Type, InputScreen.ViewModel.ProviderType {
    triggerGoToInputScreen(): void;
  }

  export class Self implements Type {
    private readonly provider: Provider.Type;
    private readonly navigator: Navigator.Type;
    private readonly goToInputScreenTrigger: Subject<void>;
    private readonly subscription: Subscription;

    public get screen(): Readonly<MVVM.Navigation.Screen.Type> {
      return Screen.HOME;
    }

    public constructor(provider: Provider.Type, navigator: Navigator.Type) {
      this.provider = provider;
      this.navigator = navigator;
      this.goToInputScreenTrigger = new Subject();
      this.subscription = new Subscription();
    }

    public initialize = (): void => {
      let subscription = this.subscription;

      this.goToInputScreenTrigger
        .doOnNext(() => this.goToInputScreen())
        .subscribe()
        .toBeDisposedBy(subscription);
    }

    public deinitialize = (): void => {
      this.subscription.unsubscribe();
    }

    public inputScreen_viewModel(): InputScreen.ViewModel.Type {
      let provider = this.provider;
      let model = new InputScreen.Model.Self(provider);
      return new InputScreen.ViewModel.Self(provider, model);
    }

    public triggerGoToInputScreen = (): void => {
      return this.goToInputScreenTrigger.next();
    }

    private goToInputScreen = (): void => {
      let info: MVVM.Navigation.Info.Type = {
        prevScreen: this.screen,
        intent: { id: 'goToInputScreen' },
      };

      let vm = this.inputScreen_viewModel();
      this.navigator.navigate(vm, info);
    }
  }
}

export namespace Component {
  export namespace Props {
    export interface Type {
      properties: Properties.Type;
      style: Style.Type;
      viewModel: ViewModel.Type;
    }
  }

  export class Self extends BaseComponent<Props.Type, StateType<any>> {
    private readonly viewModel: ViewModel.Type;

    public constructor(props: Props.Type) {
      super(props);
      this.viewModel = props.viewModel;
    }

    public componentWillMount(): void {
      this.viewModel.initialize();
    }

    public componentWillUnmount(): void {
      this.viewModel.deinitialize();
    }

    private goToInputScreen = (): void => {
      this.viewModel.triggerGoToInputScreen();
    }

    public render(): JSX.Element {
      return <View style={styles.container}>
        <Button
          onPress={this.goToInputScreen.bind(this)}
          title='Go to input screen'/>
      </View>;
    }
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});