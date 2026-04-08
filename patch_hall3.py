path = "frontend/src/pages/hall/HallPage.tsx"
with open(path, encoding="utf-8") as f:
    lines = f.readlines()
out = []
i = 0
while i < len(lines):
    if i < len(lines) - 1 and "const handleReservation = " in lines[i]:
        out.append("  const [confirmOpen, setConfirmOpen] = useState(false);\n")
        out.append("  const handleReservationClick = () => {\n")
        out.append("    if (!selectedTableId || !selectedTime) { setError('Lutfen masa ve saat secin'); return; }\n")
        out.append("    setConfirmOpen(true);\n")
        out.append("  };\n")
        out.append("  const handleReservationConfirm = () => {\n")
        out.append("    if (!selectedTableId || !selectedTime) return;\n")
        out.append("    const today = new Date();\n")
        out.append("    const [hours, minutes] = selectedTime.split(':').map(Number);\n")
        out.append("    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);\n")
        out.append("    createReservation.mutate({ tableId: selectedTableId, startTime: startTime.toISOString() }, { onSettled: () => setConfirmOpen(false) });\n")
        out.append("  };\n")
        while i < len(lines) and not lines[i].strip().startswith("const toggleFeature"):
            i += 1
        continue
    out.append(lines[i])
    i += 1
with open(path, "w", encoding="utf-8") as f:
    f.writelines(out)
print("done")
