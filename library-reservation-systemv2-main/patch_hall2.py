path = "frontend/src/pages/hall/HallPage.tsx"
with open(path, encoding="utf-8") as f:
    t = f.read()
# Add state after selectedFeatures line
if "confirmOpen" not in t:
    t = t.replace(
        "const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);",
        "const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);\n  const [confirmOpen, setConfirmOpen] = useState(false);"
    )
# Replace handleReservation body to open modal
old = """  const handleReservation = () => {
    if (!selectedTableId || !selectedTime) {
      setError('LÃ¼tfen masa ve saat seÃ§in');
      return;
    }

    const today = new Date();
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);

    createReservation.mutate({
      tableId: selectedTableId,
      startTime: startTime.toISOString(),
          });
  };"""
new = """  const handleReservationClick = () => {
    if (!selectedTableId || !selectedTime) {
      setError('Lutfen masa ve saat secin');
      return;
    }
    setConfirmOpen(true);
  };

  const handleReservationConfirm = () => {
    if (!selectedTableId || !selectedTime) return;
    const today = new Date();
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    createReservation.mutate(
      { tableId: selectedTableId, startTime: startTime.toISOString() },
      { onSettled: () => setConfirmOpen(false) }
    );
  };"""
# fuzzy match - file may have corrupted chars
if "handleReservation = ()" in t and "createReservation.mutate" in t:
    import re
    t = re.sub(
        r"const handleReservation = \(\) => \{[^}]+createReservation\.mutate\(\{[^}]+\}\s*\);\s*\};",
        new.replace("\\\\", "\\"),
        t,
        count=1,
        flags=re.DOTALL
    )
    print("regex replace")
else:
    print("pattern not found", "handleReservation" in t)
with open(path, "w", encoding="utf-8") as f:
    f.write(t)
