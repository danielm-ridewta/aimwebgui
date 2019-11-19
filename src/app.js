import React, { Component, Fragment } from "react";
import { ChannelsModal, PresetsModal } from "./components/modal";
import MonitorSet from "./components/monitorSet";
import SwapButton from "./components/swapButton";
import LoadingSpinner from "./components/loadingSpinner";
import {
  login,
  dispatchVideoLogin,
  getChannels,
  getDevices,
  getPresets,
  connectChannel,
  connectPreset,
  AIM_DispatchUtilsLogin
} from "./aimApiClient";
import styles from "./styles.scss";

const dispatchVideoUser = "d1";
const dispatchVideoDeviceOne = "DVIDRX1";
const dispatchVideoDeviceTwo = "DVIDRX2";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      receiverOne: null,
      receiverTwo: null,
      receiverThree: null,
      receiverVideoOne: null,
      receiverVideoTwo: null,
      isChannelsModalOpen: false,
      modalReceiver: null,
      isPresetsModalOpen: false,
      isLoading: false,
      error: null
    };
  }

  async componentDidMount() {
    this.setState({ isLoading: true });
    const queryString = new URLSearchParams(window.location.search);
    const id = queryString.get("id");
    const { error: loginError } = await login(id, "");
    const { error: dispatchVideoLoginError } = await dispatchVideoLogin(
      dispatchVideoUser,
      ""
    );
    const { error: AIM_DispatchutilsLoginError } = await AIM_DispatchUtilsLogin(
      "AIM_Dispatchutils",
      "2d64f62d67"
    );

    if (loginError || dispatchVideoLoginError || AIM_DispatchutilsLoginError) {
      this.setState({
        isLoading: false,
        error: {
          context: "componentDidMount.login",
          message: loginError || dispatchVideoLoginError
        }
      });
      return;
    }

    const { devices, error: getDevicesError } = await getDevices();
    const { devices: allDevices, error: getAllDevicesError } = await getDevices(
      {
        useAIM_DispatchutilsToken: true
      }
    );
    const { channels, error: getChannelsError } = await getChannels();
    const { presets, error: getPresetsError } = await getPresets();

    if (
      getDevicesError ||
      getAllDevicesError ||
      getChannelsError ||
      getPresetsError
    ) {
      this.setState({
        isLoading: false,
        error: {
          context:
            "componentDidMount.getDevices|getAllDevices|getChannels|getPresets",
          message: getDevicesError || getChannelsError || getPresetsError
        }
      });
      return;
    }

    const {
      receiverOne,
      receiverTwo,
      receiverThree,
      receiverVideoOne,
      receiverVideoTwo
    } = this.mapReceivers(devices, channels);

    this.setState({
      devices,
      allDevices,
      channels,
      presets,
      receiverOne,
      receiverTwo,
      receiverThree,
      receiverVideoOne,
      receiverVideoTwo,
      isLoading: false
    });
  }

  openChannelsModal = receiver => {
    this.setState({
      isChannelsModalOpen: true,
      modalReceiver: receiver
    });
  };

  closeChannelsModal = () => {
    this.setState({ isChannelsModalOpen: false, modalReceiver: null });
  };

  openPresetsModal = () => {
    this.setState({ isPresetsModalOpen: true });
  };

  closePresetsModal = () => {
    this.setState({ isPresetsModalOpen: false });
  };

  mapReceivers = (devices, channels) => {
    const deviceOne = devices[0];
    const deviceTwo = devices[1];
    const deviceThree = devices[2];
    const deviceVideoOne = devices.find(
      d => d.d_name === dispatchVideoDeviceOne
    );
    const deviceVideoTwo = devices.find(
      d => d.d_name === dispatchVideoDeviceTwo
    );
    let receiverOne;
    let receiverTwo;
    let receiverThree;
    let receiverVideoOne;
    let receiverVideoTwo;

    if (deviceOne) {
      const deviceChannel = channels.find(
        channel => deviceOne.c_name === channel.c_name
      );

      receiverOne = {
        deviceId: deviceOne.d_id,
        deviceName: deviceOne.d_name,
        channelId: deviceChannel.c_id,
        channelName: deviceOne.c_name,
        channelDescription: deviceChannel.c_description
      };
    }

    if (deviceTwo) {
      const deviceChannel = channels.find(
        channel => deviceTwo.c_name === channel.c_name
      );

      receiverTwo = {
        deviceId: deviceTwo.d_id,
        deviceName: deviceTwo.d_name,
        channelId: deviceChannel.c_id,
        channelName: deviceTwo.c_name,
        channelDescription: deviceChannel.c_description
      };
    }

    // Dispatch 5 only has two receivers
    if (deviceThree && deviceOne.d_name.indexOf("D5RX") === -1) {
      const deviceChannel = channels.find(
        channel => deviceThree.c_name === channel.c_name
      );

      if (deviceChannel) {
        receiverThree = {
          deviceId: deviceThree.d_id,
          deviceName: deviceThree.d_name,
          channelId: deviceChannel.c_id,
          channelName: deviceThree.c_name,
          channelDescription: deviceChannel.c_description
        };
      }
    }

    if (deviceVideoOne) {
      const deviceChannel = channels.find(
        channel => deviceVideoOne.c_name === channel.c_name
      );

      receiverVideoOne = {
        deviceId: deviceVideoOne.d_id,
        deviceName: deviceVideoOne.d_name,
        channelId: deviceChannel.c_id,
        channelName: deviceVideoOne.c_name,
        channelDescription: deviceChannel.c_description
      };
    }

    if (deviceVideoTwo) {
      const deviceChannel = channels.find(
        channel => deviceVideoTwo.c_name === channel.c_name
      );

      receiverVideoTwo = {
        deviceId: deviceVideoTwo.d_id,
        deviceName: deviceVideoTwo.d_name,
        channelId: deviceChannel.c_id,
        channelName: deviceVideoTwo.c_name,
        channelDescription: deviceChannel.c_description
      };
    }

    return {
      receiverOne,
      receiverTwo,
      receiverThree,
      receiverVideoOne,
      receiverVideoTwo
    };
  };

  selectChannel = async (channelId, deviceId) => {
    this.setState({ isLoading: true, isChannelsModalOpen: false });
    const {
      receiverVideoOne: { deviceId: dispatchVideoDeviceOneId },
      receiverVideoTwo: { deviceId: dispatchVideoDeviceTwoId }
    } = this.state;
    let useDispatchVideoToken = false;
    if (
      deviceId === dispatchVideoDeviceOneId ||
      deviceId === dispatchVideoDeviceTwoId
    ) {
      useDispatchVideoToken = true;
    }

    const response = await connectChannel(
      channelId,
      deviceId,
      useDispatchVideoToken
    );
    if (response && response.error) {
      this.setState({
        isLoading: false,
        error: {
          context: "selectChannel.connectChannel",
          message: response.error
        }
      });
      return;
    }

    const { devices, error: getDevicesError } = await getDevices();
    if (getDevicesError) {
      this.setState({
        isLoading: false,
        error: {
          context: "selectChannel.getDevices",
          message: getDevicesError
        }
      });
      return;
    }

    const { channels } = this.state;
    const {
      receiverOne,
      receiverTwo,
      receiverThree,
      receiverVideoOne,
      receiverVideoTwo
    } = this.mapReceivers(devices, channels);

    this.setState({
      devices,
      receiverOne,
      receiverTwo,
      receiverThree,
      receiverVideoOne,
      receiverVideoTwo,
      isLoading: false
    });
  };

  swapChannels = async (
    { channelId: channelAId, deviceId: deviceAId },
    { channelId: channelBId, deviceId: deviceBId }
  ) => {
    this.setState({ isLoading: true });
    const responseA = await connectChannel(channelAId, deviceBId);
    if (responseA && responseA.error) {
      this.setState({
        isLoading: false,
        error: {
          context: "swapChannels.connectChannelA",
          message: responseA.error
        }
      });
      return;
    }

    const responseB = await connectChannel(channelBId, deviceAId);
    if (responseB && responseB.error) {
      this.setState({
        isLoading: false,
        error: {
          context: "swapChannels.connectChannelB",
          message: responseB.error
        }
      });
      return;
    }

    const { devices, error: getDevicesError } = await getDevices();
    if (getDevicesError) {
      this.setState({
        isLoading: false,
        error: { context: "swapChannels.getDevices", message: getDevicesError }
      });
      return;
    }

    const { channels } = this.state;
    const { receiverOne, receiverTwo, receiverThree } = this.mapReceivers(
      devices,
      channels
    );

    this.setState({
      receiverOne,
      receiverTwo,
      receiverThree,
      isLoading: false
    });
  };

  selectPreset = async presetId => {
    this.setState({ isLoading: true, isPresetsModalOpen: false });
    const response = await connectPreset(presetId);

    if (response && response.error) {
      this.setState({
        isLoading: false,
        error: {
          context: "selectPreset.connectPreset",
          message: response.error
        }
      });
      return;
    }

    const { devices, error: getDevicesError } = await getDevices();
    if (getDevicesError) {
      this.setState({
        isLoading: false,
        error: { context: "selectPreset.getDevices", message: getDevicesError }
      });
      return;
    }

    const { channels } = this.state;
    const { receiverOne, receiverTwo, receiverThree } = this.mapReceivers(
      devices,
      channels
    );

    this.setState({
      receiverOne,
      receiverTwo,
      receiverThree,
      isLoading: false
    });
  };

  mapChannelUsage = (devices, channels) => {
    let filteredChannels = channels.filter(
      c =>
        !c.c_name.toLowerCase().includes("comp") &&
        !c.c_name.toLowerCase().includes("facvid")
    );

    let channelUsageMap = {};
    for (let channel of filteredChannels) {
      const device = devices.find(d => d.c_name === channel.c_name) || null;
      if (device) {
        channelUsageMap[channel.c_name] =
          device && device.d_name.substring(0, 2);
      }
    }

    return channelUsageMap;
  };

  refresh = () => {
    window.location.reload();
  };

  render() {
    const {
      receiverOne,
      receiverTwo,
      receiverThree,
      receiverVideoOne,
      receiverVideoTwo,
      channels,
      devices,
      allDevices,
      presets,
      isChannelsModalOpen,
      modalReceiver,
      isPresetsModalOpen,
      isLoading,
      error
    } = this.state;

    if (error) {
      return (
        <div className={styles.error}>
          <div>Context: {error.context}</div>
          <div>Error: {error.message}</div>
          <button className={styles.refreshButton} onClick={this.refresh}>
            Refresh
          </button>
        </div>
      );
    }

    if (!channels && !devices && !allDevices && !presets) {
      return (
        <div className={styles.loadingSpinner}>
          <LoadingSpinner />
        </div>
      );
    }

    let channelUsageMap = this.mapChannelUsage(allDevices, channels);

    return (
      <div className={styles.app}>
        <div className={styles.container}>
          <button
            className={styles.layoutPresetsButton}
            onClick={this.openPresetsModal}
          >
            Layout Presets
          </button>
          <div className={styles.sharedDisplays}>
            <MonitorSet
              receiver={receiverVideoOne}
              openChannelsModal={this.openChannelsModal}
              monitorWidth="150"
              monitorHeight="150"
            />
            <MonitorSet
              receiver={receiverVideoTwo}
              openChannelsModal={this.openChannelsModal}
              monitorWidth="150"
              monitorHeight="150"
            />
          </div>
          {receiverThree && (
            <Fragment>
              <div className={styles.topRow}>
                <MonitorSet
                  receiver={receiverThree}
                  openChannelsModal={this.openChannelsModal}
                />
              </div>
              <div className={styles.middleRow}>
                <SwapButton
                  className={styles.swapTopLeft}
                  swapChannels={() => {
                    this.swapChannels(receiverOne, receiverThree);
                  }}
                />
                <div className={styles.spacer} />
                <SwapButton
                  className={styles.swapRightTop}
                  swapChannels={() => {
                    this.swapChannels(receiverTwo, receiverThree);
                  }}
                />
              </div>
            </Fragment>
          )}
          <div className={styles.bottomRow}>
            <div className={styles.left}>
              <MonitorSet
                receiver={receiverOne}
                openChannelsModal={this.openChannelsModal}
              />
            </div>
            <SwapButton
              className={styles.swapLeftRight}
              swapChannels={() => {
                this.swapChannels(receiverOne, receiverTwo);
              }}
            />
            <div className={styles.right}>
              <MonitorSet
                receiver={receiverTwo}
                openChannelsModal={this.openChannelsModal}
              />
            </div>
          </div>
        </div>
        <ChannelsModal
          isOpen={isChannelsModalOpen}
          channels={channels}
          channelUsageMap={channelUsageMap}
          closeModal={this.closeChannelsModal}
          receiver={modalReceiver}
          selectChannel={this.selectChannel}
        />
        <PresetsModal
          isOpen={isPresetsModalOpen}
          presets={presets}
          closeModal={this.closePresetsModal}
          selectPreset={this.selectPreset}
        />
        {isLoading ? (
          <div className={styles.loadingSpinner}>
            <LoadingSpinner />
          </div>
        ) : null}
      </div>
    );
  }
}

export default App;
