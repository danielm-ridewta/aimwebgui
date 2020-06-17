import React from "react";
import Modal from "./modal";
import styles from "./styles.scss";

const ChannelsModal = ({
  isOpen,
  channels,
  channelUsageMap,
  closeModal,
  receiver,
  selectChannel,
}) => {
  let availableChannels = channels.filter(
    (channel) => !channelUsageMap[channel.c_name]
  );
  let inUseChannels = channels.filter(
    (channel) => channelUsageMap[channel.c_name]
  );

  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      <div className={styles.header}>
        <div>Channels</div>
        <button className={styles.closeButton} onClick={closeModal}>
          X
        </button>
      </div>
      <div className={styles.channelsList}>
        <div className={styles.availableChannels}>
          <div className={styles.channelStatus}>Available</div>
          <div>
            {availableChannels.map((channel) => (
              <div
                className={
                  channel.c_id === (receiver && receiver.channelId)
                    ? styles.selectedChannel
                    : styles.channel
                }
                onClick={() => {
                  selectChannel(channel.c_id, receiver.deviceId);
                }}
                key={channel.c_id}
              >
                {channel.c_description}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.inUseChannels}>
          <div className={styles.channelStatus}>In Use</div>
          {inUseChannels.map((channel) => (
            <div
              className={
                channel.c_id === (receiver && receiver.channelId)
                  ? styles.selectedChannel
                  : styles.channel
              }
              onClick={() => {
                selectChannel(channel.c_id, receiver.deviceId);
              }}
              key={channel.c_id}
            >
              {`${channel.c_description} (${channelUsageMap[channel.c_name]})`}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ChannelsModal;
