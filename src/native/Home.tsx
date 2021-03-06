import { Subject, Subscription } from 'rxjs';
import * as React from 'react';
import { Component as BaseComponent } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { StateType } from 'type-safe-state-js';
import { MVVM } from 'react-base-utilities-js';
import { Provider as BaseProvider } from './../Dependency';
import * as Properties from './Properties';
import * as Style from './Style';
import * as Navigator from './Navigator';
import * as InputScreen from './Input';
import * as PhoneInput from './PhoneInput';
import * as Navigation from './Navigation';
import * as Screen from './Screen';

export namespace Provider {
  export interface Type extends BaseProvider.Type {}
}

export namespace ViewModel {
  export interface Type extends
    MVVM.ViewModel.Type,
    InputScreen.ViewModel.ProviderType,
    PhoneInput.ViewModel.ProviderType {
    triggerGoToInputScreen(props: Navigation.Props.Type): void;
    triggerGoToPhoneInputScreen(props: Navigation.Props.Type): void;
  }

  export class Self implements Type {
    private readonly provider: Provider.Type;
    private readonly navigator: Navigator.Type;
    private readonly goToInputScreenTrigger: Subject<Navigation.Props.Type>;
    private readonly goToPhoneInputScreenTrigger: Subject<Navigation.Props.Type>;
    private readonly subscription: Subscription;

    public get screen(): MVVM.Navigation.Screen.BaseType {
      return Screen.HOME;
    }

    public constructor(provider: Provider.Type, navigator: Navigator.Type) {
      this.provider = provider;
      this.navigator = navigator;
      this.goToInputScreenTrigger = new Subject();
      this.goToPhoneInputScreenTrigger = new Subject();
      this.subscription = new Subscription();
    }

    public initialize = (): void => {
      let subscription = this.subscription;

      this.goToInputScreenTrigger
        .doOnNext(v => this.goToInputScreen(v))
        .subscribe()
        .toBeDisposedBy(subscription);

      this.goToPhoneInputScreenTrigger
        .doOnNext(v => this.goToPhoneInputScreen(v))
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

    public phoneInputScreen_viewModel(): PhoneInput.ViewModel.Type {
      let provider = this.provider;
      let model = new PhoneInput.Model.Self(provider);
      return new PhoneInput.ViewModel.Self(provider, model);
    }

    public triggerGoToInputScreen = (props: Navigation.Props.Type): void => {
      return this.goToInputScreenTrigger.next(props);
    }

    private goToInputScreen = (props: Navigation.Props.Type): void => {
      let info: MVVM.Navigation.Info.Type = {
        prevScreen: this.screen,
        intent: { id: 'goToInputScreen' },
      };

      let vm = this.inputScreen_viewModel();
      let params = { ...props, viewModel: vm };
      this.navigator.navigate(params, info);
    }

    public triggerGoToPhoneInputScreen = (props: Navigation.Props.Type): void => {
      return this.goToPhoneInputScreenTrigger.next(props);
    }

    private goToPhoneInputScreen = (props: Navigation.Props.Type): void => {
      let info: MVVM.Navigation.Info.Type = {
        prevScreen: this.screen,
        intent: { id: 'goToPhoneInputScreen' },
      };

      let vm = this.phoneInputScreen_viewModel();
      let params = { ...props, viewModel: vm };
      this.navigator.navigate(params, info);
    }
  }
}

export namespace Component {
  export namespace Props {
    export interface Type {
      propertiesProvider: Properties.Type;
      styleProvider: Style.Type;
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
      let props = this.props;

      let navProps: Navigation.Props.Type = {
        propertiesProvider: props.propertiesProvider,
        styleProvider: props.styleProvider,
      };

      this.viewModel.triggerGoToInputScreen(navProps);
    }

    private goToPhoneInputScreen = (): void => {
      let props = this.props;

      let navProps: Navigation.Props.Type = {
        propertiesProvider: props.propertiesProvider,
        styleProvider: props.styleProvider,
      };

      this.viewModel.triggerGoToPhoneInputScreen(navProps);
    }

    public render(): JSX.Element {
      return <View style={styles.container}>
        <Button
          onPress={this.goToInputScreen.bind(this)}
          title='Go to input screen'/>

        <Button
          onPress={this.goToPhoneInputScreen.bind(this)}
          title='Go to phone input screen'/>
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