import { useState, useCallback, useEffect } from "react";

type ModalType = "feature" | "nickname" | "account" | "character";

export const useModalManagement = (user: any) => {
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showAccountLinkModal, setShowAccountLinkModal] = useState(false);
  const [showCharacterInfoModal, setShowCharacterInfoModal] = useState(false);
  const [featureMessage, setFeatureMessage] = useState("");

  useEffect(() => {
    const hasShownAccountModal = localStorage.getItem("hasShownAccountModal");
    if (!hasShownAccountModal && user) {
      setShowAccountLinkModal(true);
      localStorage.setItem("hasShownAccountModal", "true");
    }
  }, [user]);

  const handleModalOpen = useCallback((modalType: ModalType) => {
    switch (modalType) {
      case "feature":
        setShowFeatureModal(true);
        break;
      case "nickname":
        setShowNicknameModal(true);
        break;
      case "account":
        setShowAccountLinkModal(true);
        break;
      case "character":
        setShowCharacterInfoModal(true);
        break;
    }
  }, []);

  const handleModalClose = useCallback((modalType: ModalType) => {
    switch (modalType) {
      case "feature":
        setShowFeatureModal(false);
        break;
      case "nickname":
        setShowNicknameModal(false);
        break;
      case "account":
        setShowAccountLinkModal(false);
        break;
      case "character":
        setShowCharacterInfoModal(false);
        break;
    }
  }, []);

  return {
    showFeatureModal,
    showNicknameModal,
    showAccountLinkModal,
    showCharacterInfoModal,
    featureMessage,
    handleModalOpen,
    handleModalClose,
    setFeatureMessage,
  };
};
