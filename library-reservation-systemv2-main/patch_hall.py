path = "frontend/src/pages/hall/HallPage.tsx"
with open(path, encoding="utf-8") as f:
    t = f.read()
old = """      queryClient.invalidateQueries({ queryKey: ['hall-availability'] });
      navigate('/my-reservation');"""
new = """      queryClient.invalidateQueries({ queryKey: ['hall-availability'] });
      queryClient.invalidateQueries({ queryKey: ['active-reservation'] });
      queryClient.invalidateQueries({ queryKey: ['overall-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-status'] });
      navigate('/my-reservation');"""
if old in t:
    t = t.replace(old, new)
    print("invalidation ok")
else:
    print("invalidation block not found")
with open(path, "w", encoding="utf-8") as f:
    f.write(t)
