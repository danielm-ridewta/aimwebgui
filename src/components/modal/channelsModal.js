import React from "react";
import Modal from "./modal";
import styles from "./styles.scss";

const ChannelsModal = ({
  isOpen,
  channels,
  channelUsageMap,
  closeModal,
  receiver,
  selectChannel
}) => (
  <Modal isOpen={isOpen} closeModal={closeModal}>
    <div className={styles.header}>
      <div>Channels</div>
      <button className={styles.closeButton} onClick={closeModal}>
        X
      </button>
    </div>
    <div>
      {channels &&
        channels.map(channel => (
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
            {`${channel.c_description} ${
              channelUsageMap[channel.c_name]
                ? "(" + channelUsageMap[channel.c_name] + ")"
                : ""
            }`}
          </div>
        ))}
    </div>
  </Modal>
);

export default ChannelsModal;
